import { prisma } from '@/lib/prisma';
import { LayoutDashboard, Box, TableProperties, BarChart3, Activity, Users } from 'lucide-react';
import SyncButton from '@/components/SyncButton';
import SettingsModal from '@/components/SettingsModal';
import BrandMenu from '@/components/BrandMenu';
import FilterBar from '@/components/FilterBar';
import TaskTable from '@/components/TaskTable';
import KanbanBoard from '@/components/KanbanBoard';
import Pagination from '@/components/Pagination';
import InsightsDashboard from '@/components/InsightsDashboard';
import LeaderboardDashboard from '@/components/LeaderboardDashboard';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { signIn } from 'next-auth/react'; // This won't work in server component directly for interaction, better to use a client component or redirect. Wait, NextAuth provides a server-side redirect or a login link.
import LoginButton from '@/components/LoginButton';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getServerSession(authOptions) as any;

  if (!session?.user?.id) {
    return (
      <div className="h-screen overflow-hidden bg-white flex font-sans">
        <div className="hidden lg:flex lg:w-2/3 bg-slate-50 flex-col relative overflow-hidden border-r border-slate-200 pt-10 lg:pt-14 px-10 lg:px-16">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 z-0"></div>

          <div className="relative z-10 max-w-2xl mb-8 flex-shrink-0">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">Master your GitHub workflow across all repositories.</h2>
            <p className="text-md text-slate-600 mb-4 leading-relaxed">
              OmniGit provides a unified workspace to track issues, visualize progress on Kanban boards, and monitor team insights without ever switching tabs.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700 mt-6">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <span className="text-lg">🚀</span> Multi-Repo Sync
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <span className="text-lg">📊</span> Team Insights
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <span className="text-lg">⚡</span> Kanban Boards
              </div>
            </div>
          </div>

          <div className="relative z-10 flex-1 w-full rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-x border-slate-200 overflow-hidden bg-white">
            <img
              src="/screenshoot/preview.png"
              alt="OmniGit Preview"
              className="w-full h-full object-cover object-left-top"
            />
          </div>
        </div>

        {/* Right Panel - Login */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-between p-8 sm:p-12 bg-white">
          <div className="w-full"></div> {/* Spacer */}
          
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-6">
              <img src="/icon.png" alt="OmniGit Logo" className="rounded-xl w-12 h-12 object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Welcome to OmniGit</h1>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">
              Connect your GitHub account to seamlessly manage your repositories, tasks, and agile boards.
            </p>
            <div className="w-full flex items-center justify-center">
              <LoginButton />
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-1 text-xs font-medium text-slate-400 mt-8">
            Made with <span className="text-red-500 text-sm">♥</span> by 
            <a 
              href="https://github.com/mattkedder" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors hover:underline ml-0.5"
            >
              <img src="https://github.com/mattkedder.png" alt="mattkedder" className="w-3.5 h-3.5 rounded-full" />
              @mattkedder
            </a>
          </div>
        </div>
      </div>
    );
  }

  const userId = session.user.id;
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams.view || 'list';
  const page = parseInt(resolvedSearchParams.page || '1') || 1;
  const take = view === 'list' ? 20 : undefined;
  const skip = view === 'list' ? (page - 1) * 20 : undefined;

  const where: Prisma.TaskWhereInput = {
    repository: { userId }
  };

  if (resolvedSearchParams.q) {
    where.title = { contains: resolvedSearchParams.q };
  }
  if (resolvedSearchParams.repo) {
    where.repository = { userId, fullName: resolvedSearchParams.repo };
  }
  if (resolvedSearchParams.type) {
    where.type = resolvedSearchParams.type;
  }
  if (resolvedSearchParams.state) {
    where.state = resolvedSearchParams.state;
  }
  if (resolvedSearchParams.status) {
    where.boardStatus = resolvedSearchParams.status;
  }
  if (resolvedSearchParams.label) {
    where.labels = { contains: resolvedSearchParams.label };
  }
  if (resolvedSearchParams.assignee) {
    if (resolvedSearchParams.assignee === 'Unassigned') {
      where.assigneeLogin = null;
    } else {
      where.assigneeLogin = resolvedSearchParams.assignee;
    }
  }
  if (resolvedSearchParams.milestone) {
    if (resolvedSearchParams.milestone === 'No Milestone') {
      where.milestone = null;
    } else {
      where.milestone = resolvedSearchParams.milestone;
    }
  }

  const whereWithoutAssignee = { ...where };
  delete (whereWithoutAssignee as any).assigneeLogin;

  const orderBy: Prisma.TaskOrderByWithRelationInput = {};
  const sort = resolvedSearchParams.sort || 'updatedAt';
  const order = resolvedSearchParams.order === 'asc' ? 'asc' : 'desc';

  if (sort === 'title') orderBy.title = order;
  else if (sort === 'boardStatus') orderBy.boardStatus = order;
  else if (sort === 'type') orderBy.type = order;
  else if (sort === 'state') orderBy.state = order;
  else orderBy.updatedAt = order;

  const [tasks, totalTasks, repos, distinctStatusesData, distinctAssigneesDataPromise, distinctMilestonesData] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { repository: true },
    }),
    prisma.task.count({ where }),
    prisma.repository.findMany({ where: { userId, isActive: true }, select: { fullName: true } }),
    prisma.task.findMany({ where, select: { boardStatus: true }, distinct: ['boardStatus'] }),
    prisma.task.findMany({ where: whereWithoutAssignee, select: { assigneeLogin: true, assigneeAvatar: true }, distinct: ['assigneeLogin'] }),
    prisma.task.findMany({ where, select: { milestone: true }, distinct: ['milestone'] })
  ]);

  const totalPages = view === 'list' ? Math.ceil(totalTasks / 20) : 1;
  const hasToken = !!session?.accessToken;

  // Fetch user and all repositories for the Settings Modal if token exists
  let githubUser = null;
  let allRepositories: any[] = [];
  if (hasToken) {
    const { getGitHubUser, getRepositories } = await import('@/actions/settings');
    // these actions will need to be updated to use session instead of token string directly, 
    // but for now we call them without arguments if they fetch session internally.
    [githubUser, allRepositories] = await Promise.all([
      getGitHubUser(),
      getRepositories()
    ]);
  }

  let boardStatuses = distinctStatusesData
    .map(t => t.boardStatus)
    .filter((s): s is string => Boolean(s));

  if (boardStatuses.length === 0) {
    boardStatuses = ['Backlog'];
  } else {
    // Sort them so Backlog is usually first or they're alphabetical
    boardStatuses.sort();
  }

  const distinctAssigneesData = distinctAssigneesDataPromise as { assigneeLogin: string | null, assigneeAvatar: string | null }[];
  const assignees = distinctAssigneesData
    .filter(t => t.assigneeLogin !== null)
    .map(t => ({ login: t.assigneeLogin as string, avatar: t.assigneeAvatar }))
    .sort((a, b) => a.login.localeCompare(b.login));

  const milestones = distinctMilestonesData
    .map(t => t.milestone)
    .filter((s): s is string => Boolean(s))
    .sort();

  const labelNames = ['bug', 'enhancement', 'documentation', 'help wanted'];

  const cleanSearchParams: Record<string, string> = {};
  Object.entries(resolvedSearchParams).forEach(([k, v]) => {
    if (v) cleanSearchParams[k] = v;
  });

  let lastSyncFormatted = 'Never';
  // If we want lastSync per user, we could store it on User. For now we will hide it.

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-purple-100">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <BrandMenu />

              {/* <div className="hidden xl:flex ml-4 px-2.5 py-1 bg-slate-50 rounded-md items-center gap-3 text-xs font-medium text-slate-600 border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>{repos.length} Active Repos</span>
                </div>
                <div className="w-px h-3 bg-slate-300"></div>
                <span>{totalTasks} Open Tasks</span>
              </div> */}
            </div>

            <div className="flex items-center gap-1 h-14 text-sm font-medium shrink-0">
              <Link
                href={`/?${new URLSearchParams({ ...cleanSearchParams, view: 'list' }).toString()}`}
                className={`flex items-center gap-2 px-3 h-8 rounded-md transition-colors ${view === 'list' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <TableProperties className="w-4 h-4" /> Table
              </Link>
              <Link
                href={`/?${new URLSearchParams({ ...cleanSearchParams, view: 'board' }).toString()}`}
                className={`flex items-center gap-2 px-3 h-8 rounded-md transition-colors ${view === 'board' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Board
              </Link>
              <Link
                href={`/?${new URLSearchParams({ ...cleanSearchParams, view: 'insights' }).toString()}`}
                className={`flex items-center gap-2 px-3 h-8 rounded-md transition-colors ${view === 'insights' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <Activity className="w-4 h-4" /> Insights
              </Link>
              <Link
                href={`/?${new URLSearchParams({ ...cleanSearchParams, view: 'leaderboard' }).toString()}`}
                className={`flex items-center gap-2 px-3 h-8 rounded-md transition-colors ${view === 'leaderboard' ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <Users className="w-4 h-4" /> Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-2">
            <div className="hidden xl:flex flex-col items-end justify-center mr-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Last Sync</span>
              <span className="text-xs font-medium text-slate-600 leading-tight">{lastSyncFormatted}</span>
            </div>
            <SyncButton />
            <SettingsModal hasToken={hasToken} user={githubUser} repositories={allRepositories} />
          </div>
        </div>
      </header>

      <main className="w-full">
        <FilterBar
          repos={repos}
          boardStatuses={boardStatuses}
          labelNames={labelNames}
          assignees={assignees}
          milestones={milestones}
        />

        {view === 'leaderboard' ? (
          <LeaderboardDashboard tasks={tasks.map(t => ({ ...t, githubId: t.githubId.toString() })) as any} />
        ) : view === 'insights' ? (
          <InsightsDashboard tasks={tasks.map(t => ({ ...t, githubId: t.githubId.toString() })) as any} />
        ) : view === 'board' ? (
          cleanSearchParams.repo ? (
            <KanbanBoard tasks={tasks.map(t => ({ ...t, githubId: t.githubId.toString() })) as any} boardStatuses={boardStatuses} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[600px] p-8">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4">
                <Box className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Repository Required</h2>
              <p className="text-slate-500 text-sm max-w-md text-center">
                To view the Kanban board, please select a specific repository from the filter dropdown above.
              </p>
            </div>
          )
        ) : (
          <TaskTable
            tasks={tasks.map(t => ({ ...t, githubId: t.githubId.toString() })) as any}
            page={page}
            searchParams={cleanSearchParams}
          />
        )}

        {view === 'list' && (
          <Pagination
            page={page}
            totalPages={totalPages}
            searchParams={cleanSearchParams}
          />
        )}
      </main>
    </div>
  );
}
