'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTask(repoFullName: string, title: string, body: string) {
  // 1. Get Token
  const token = await prisma.setting.findUnique({ where: { key: 'github_token' } });
  if (!token?.value) {
    throw new Error('GitHub token not found');
  }

  // 2. Fetch Repo ID from local DB
  const repo = await prisma.repository.findUnique({ where: { fullName: repoFullName } });
  if (!repo) {
    throw new Error('Repository not found in local database');
  }

  // 3. Create Issue on GitHub
  const headers = {
    Authorization: `Bearer ${token.value}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const response = await fetch(`https://api.github.com/repos/${repoFullName}/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title,
      body,
      labels: ['product iteration'] // as mentioned in the UI
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GitHub API Error:', errorText);
    throw new Error('Failed to create issue on GitHub');
  }

  const issue = await response.json();

  // 4. Save to local DB
  await prisma.task.create({
    data: {
      githubId: BigInt(issue.id),
      repoId: repo.id,
      title: issue.title,
      state: issue.state,
      type: 'issue',
      url: issue.html_url,
      number: issue.number,
      assigneeAvatar: issue.assignee?.avatar_url || null,
      assigneeLogin: issue.assignee?.login || null,
      body: issue.body,
      labels: JSON.stringify(issue.labels || []),
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      boardStatus: 'Backlog', // Give it a default board status
    },
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateBoardStatus(taskId: string, boardStatus: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { boardStatus },
  });
  
  revalidatePath('/');
  return { success: true };
}
