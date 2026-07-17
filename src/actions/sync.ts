'use server'

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function syncRepository(fullName: string) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id || !session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id;
  const token = session.accessToken;

  const repo = await prisma.repository.findUnique({ 
    where: { userId_fullName: { userId, fullName } } 
  });
  if (!repo) return { success: false, count: 0 };

  const [owner, name] = fullName.split('/');
  
  let hasNextPage = true;
  let cursor: string | null = null;
  let totalSynced = 0;

  const query = `
    query($owner: String!, $name: String!, $cursor: String) {
      repository(owner: $owner, name: $name) {
        issues(first: 50, after: $cursor, states: [OPEN]) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            databaseId
            number
            title
            state
            url
            body
            createdAt
            updatedAt
            assignees(first: 1) {
              nodes {
                login
                avatarUrl
              }
            }
            milestone {
              title
            }
            labels(first: 20) {
              nodes {
                name
                color
              }
            }
            projectItems(first: 10) {
              nodes {
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const res: any = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { owner, name, cursor }
      })
    });

    if (!res.ok) {
      console.error('GraphQL HTTP error:', await res.text());
      break;
    }

    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL validation errors:', json.errors);
      break;
    }

    const issuesData = json.data?.repository?.issues;
    if (!issuesData) break;

    const issues = issuesData.nodes || [];
    
    for (const issue of issues) {
      if (!issue.databaseId) continue;

      // Extract Project V2 Status
      let boardStatus = 'Backlog'; // Default fallback
      
      const projectItems = issue.projectItems?.nodes || [];
      for (const pItem of projectItems) {
        const fieldValues = pItem.fieldValues?.nodes || [];
        for (const fv of fieldValues) {
          if (fv.field?.name === 'Status' && fv.name) {
            boardStatus = fv.name;
          }
        }
      }

      // Extract Assignee
      const assigneeNode = issue.assignees?.nodes?.[0];
      const assigneeLogin = assigneeNode?.login || null;
      const assigneeAvatar = assigneeNode?.avatarUrl || null;

      // Extract Labels
      const labels = (issue.labels?.nodes || []).map((l: any) => ({ name: l.name, color: l.color }));

      await prisma.task.upsert({
        where: {
          githubId_repoId: { githubId: BigInt(issue.databaseId), repoId: repo.id },
        },
        update: {
          title: issue.title,
          state: issue.state?.toLowerCase() || 'open',
          updatedAt: new Date(issue.updatedAt),
          assigneeAvatar,
          assigneeLogin,
          body: issue.body || '',
          labels: JSON.stringify(labels),
          boardStatus,
          milestone: issue.milestone?.title || null,
        },
        create: {
          githubId: BigInt(issue.databaseId),
          repoId: repo.id,
          title: issue.title,
          state: issue.state?.toLowerCase() || 'open',
          type: 'issue',
          url: issue.url,
          number: issue.number,
          assigneeAvatar,
          assigneeLogin,
          body: issue.body || '',
          labels: JSON.stringify(labels),
          boardStatus,
          milestone: issue.milestone?.title || null,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
        },
      });
      totalSynced++;
    }

    hasNextPage = issuesData.pageInfo?.hasNextPage || false;
    cursor = issuesData.pageInfo?.endCursor || null;
  }

  return { success: true, count: totalSynced };
}

export async function syncAllRepositories() {
  const { revalidatePath } = await import('next/cache');
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) throw new Error('Not authenticated');

  const userId = session.user.id;
  const repos = await prisma.repository.findMany({ where: { userId, isActive: true } });
  
  let totalCount = 0;
  for (const repo of repos) {
    try {
      const result = await syncRepository(repo.fullName);
      if (result) totalCount += result.count;
    } catch (e) {
      console.error(`Failed to sync ${repo.fullName}:`, e);
    }
  }

  revalidatePath('/');
  return { success: true, count: totalCount };
}
