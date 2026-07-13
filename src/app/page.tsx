import { prisma } from '@/lib/prisma';
import { LayoutDashboard, FileText, Box, TableProperties, Plus, BarChart3, Activity } from 'lucide-react';
import SyncButton from '@/components/SyncButton';
import SettingsModal from '@/components/SettingsModal';
import FilterBar from '@/components/FilterBar';
import TaskTable from '@/components/TaskTable';
import KanbanBoard from '@/components/KanbanBoard';
import Pagination from '@/components/Pagination';
import InsightsDashboard from '@/components/InsightsDashboard';
import { Prisma } from '@prisma/client';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams.view || 'list';
  const page = parseInt(resolvedSearchParams.page || '1') || 1;
  const take = view === 'list' ? 20 : undefined;
  const skip = view === 'list' ? (page - 1) * 20 : undefined;

  const where: Prisma.TaskWhereInput = {};

  if (resolvedSearchParams.q) {
    where.title = { contains: resolvedSearchParams.q };
  }
  if (resolvedSearchParams.repo) {
    where.repository = { fullName: resolvedSearchParams.repo };
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

  const [tasks, totalTasks, repos, tokenSetting, lastSyncSetting, distinctStatusesData, distinctAssigneesDataPromise, distinctMilestonesData] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { repository: true },
    }),
    prisma.task.count({ where }),
    prisma.repository.findMany({ where: { isActive: true }, select: { fullName: true } }),
    prisma.setting.findUnique({ where: { key: 'github_token' } }),
    prisma.setting.findUnique({ where: { key: 'last_sync' } }),
    prisma.task.findMany({ where, select: { boardStatus: true }, distinct: ['boardStatus'] }),
    prisma.task.findMany({ where: whereWithoutAssignee, select: { assigneeLogin: true, assigneeAvatar: true }, distinct: ['assigneeLogin'] }),
    prisma.task.findMany({ where, select: { milestone: true }, distinct: ['milestone'] })
  ]);

  const totalPages = view === 'list' ? Math.ceil(totalTasks / 20) : 1;
  const hasToken = !!(tokenSetting && tokenSetting.value);

  // Fetch user and all repositories for the Settings Modal if token exists
  let githubUser = null;
  let allRepositories = [];
  if (hasToken) {
    const { getGitHubUser, getRepositories } = await import('@/actions/settings');
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
  if (lastSyncSetting && lastSyncSetting.value) {
    const d = new Date(lastSyncSetting.value);
    lastSyncFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-purple-100">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden">
                <img src="/icons/icon-96x96.png" alt="OmniGit Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">OmniGit</h1>

              <div className="ml-4 px-2.5 py-1 bg-slate-50 rounded-md flex items-center gap-3 text-xs font-medium text-slate-600 border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>{repos.length} Active Repos</span>
                </div>
                <div className="w-px h-3 bg-slate-300"></div>
                <span>{totalTasks} Total Tasks</span>
              </div>
            </div>

            <div className="flex items-center gap-1 h-14 text-sm font-medium">
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
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end justify-center mr-1">
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

        {view === 'insights' ? (
          <InsightsDashboard tasks={tasks} />
        ) : view === 'board' ? (
          cleanSearchParams.repo ? (
            <KanbanBoard tasks={tasks} boardStatuses={boardStatuses} />
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
            tasks={tasks}
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
