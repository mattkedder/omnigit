'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getGitHubToken() {
  const token = await prisma.setting.findUnique({ where: { key: 'github_token' } });
  return token?.value || '';
}

export async function saveGitHubToken(token: string) {
  await prisma.setting.upsert({
    where: { key: 'github_token' },
    update: { value: token },
    create: { key: 'github_token', value: token },
  });
  revalidatePath('/');
  return { success: true };
}

export async function clearGitHubData() {
  await prisma.task.deleteMany({});
  await prisma.repository.deleteMany({});
  await prisma.setting.delete({ where: { key: 'github_token' } }).catch(() => {});
  await prisma.setting.delete({ where: { key: 'last_sync' } }).catch(() => {});
  revalidatePath('/');
  return { success: true };
}

export async function getGitHubUser() {
  const token = await getGitHubToken();
  if (!token) return null;
  
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching github user', e);
    return null;
  }
}

export async function getRepositories() {
  return await prisma.repository.findMany({
    orderBy: { fullName: 'asc' }
  });
}

export async function fetchGitHubRepositories() {
  const token = await getGitHubToken();
  if (!token) throw new Error('No GitHub token');

  let repos: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch repositories from GitHub');
    }

    const data = await res.json();
    repos = repos.concat(data);

    if (data.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }
  
  for (const repo of repos) {
    await prisma.repository.upsert({
      where: { fullName: repo.full_name },
      update: {},
      create: {
        fullName: repo.full_name,
        owner: repo.owner.login,
        name: repo.name,
        isActive: false, // Default to false, let user activate
        source: 'github'
      }
    });
  }

  revalidatePath('/');
  return { success: true };
}

export async function toggleRepository(fullName: string, isActive: boolean) {
  await prisma.repository.update({
    where: { fullName },
    data: { isActive },
  });
  revalidatePath('/');
  return { success: true };
}

export async function toggleAllRepositories(isActive: boolean) {
  await prisma.repository.updateMany({
    data: { isActive },
  });
  revalidatePath('/');
  return { success: true };
}
