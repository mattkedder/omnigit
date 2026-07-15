'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getGitHubToken() {
  const session = await getServerSession(authOptions) as any;
  return session?.accessToken || '';
}

export async function clearGitHubData() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) throw new Error('Not authenticated');
  const userId = session.user.id;

  await prisma.task.deleteMany({
    where: { repository: { userId } }
  });
  await prisma.repository.deleteMany({
    where: { userId }
  });
  
  revalidatePath('/');
  return { success: true };
}

export async function getGitHubUser() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user) return null;
  return session.user; // NextAuth session already has name, email, image
}

export async function getRepositories() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) return [];
  
  return await prisma.repository.findMany({
    where: { userId: session.user.id },
    orderBy: { fullName: 'asc' }
  });
}

export async function fetchGitHubRepositories() {
  const token = await getGitHubToken();
  const session = await getServerSession(authOptions) as any;
  if (!token || !session?.user?.id) throw new Error('No GitHub token or not authenticated');
  
  const userId = session.user.id;

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
      where: { userId_fullName: { userId, fullName: repo.full_name } },
      update: {},
      create: {
        userId,
        fullName: repo.full_name,
        owner: repo.owner.login,
        name: repo.name,
        isActive: false,
        source: 'github'
      }
    });
  }

  revalidatePath('/');
  return { success: true };
}

export async function toggleRepository(fullName: string, isActive: boolean) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) throw new Error('Not authenticated');
  
  await prisma.repository.update({
    where: { userId_fullName: { userId: session.user.id, fullName } },
    data: { isActive },
  });
  revalidatePath('/');
  return { success: true };
}

export async function toggleAllRepositories(isActive: boolean) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) throw new Error('Not authenticated');
  
  await prisma.repository.updateMany({
    where: { userId: session.user.id },
    data: { isActive },
  });
  revalidatePath('/');
  return { success: true };
}
