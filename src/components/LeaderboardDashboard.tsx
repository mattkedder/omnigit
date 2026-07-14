'use client';

import { Prisma } from '@prisma/client';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Trophy, Clock, TrendingUp, TrendingDown, CircleDot, ChevronLeft, ChevronRight, Info, CalendarClock, X, ExternalLink } from 'lucide-react';

type TaskWithRepo = Prisma.TaskGetPayload<{
  include: { repository: true }
}>;

type LeaderboardProps = {
  tasks: TaskWithRepo[];
};

type AssigneeData = {
  name: string;
  avatar: string | null;
  count: number;
  closedCount: number;
  statusCounts: Record<string, number>;
  totalDaysOpen: number;
};

type TodayTask = {
  id: string;
  title: string;
  updatedAt: Date;
  url: string;
  boardStatus: string | null;
};

type TodayAssignee = {
  name: string;
  avatar: string | null;
  tasks: TodayTask[];
};

const PAGE_SIZE = 10;

export default function LeaderboardDashboard({ tasks }: LeaderboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<TodayAssignee | null>(null);

  const { assignees, topPerformer, avgResolutionDays, activeCount, completionRate,
    thisWeekClosed, lastWeekClosed } = useMemo(() => {
      const assigneeMap = new Map<string, AssigneeData>();
      const now = Date.now();
      let thisWeekClosed = 0;
      let lastWeekClosed = 0;

      tasks.forEach(task => {
        const assignee = task.assigneeLogin || 'Unassigned';
        if (!assigneeMap.has(assignee)) {
          assigneeMap.set(assignee, {
            name: assignee,
            avatar: task.assigneeAvatar,
            count: 0,
            closedCount: 0,
            statusCounts: {},
            totalDaysOpen: 0,
          });
        }
        const a = assigneeMap.get(assignee)!;
        a.count++;
        const status = task.boardStatus || 'No Status';
        a.statusCounts[status] = (a.statusCounts[status] || 0) + 1;
        const daysOpen = (now - new Date(task.createdAt).getTime()) / 86400000;
        a.totalDaysOpen += daysOpen;

        if (task.state.toLowerCase() === 'closed') {
          a.closedCount++;
          const daysSince = (now - new Date(task.updatedAt).getTime()) / 86400000;
          if (daysSince <= 7) thisWeekClosed++;
          else if (daysSince <= 14) lastWeekClosed++;
        }
      });

      const sorted = Array.from(assigneeMap.values())
        .filter(a => a.name !== 'Unassigned')
        .sort((a, b) => b.count - a.count);

      const topPerformer = sorted[0] || null;
      const activeCount = sorted.length;
      const totalClosed = sorted.reduce((s, a) => s + a.closedCount, 0);
      const totalTasks = sorted.reduce((s, a) => s + a.count, 0);
      const completionRate = totalTasks > 0 ? Math.round((totalClosed / totalTasks) * 100) : 0;
      const avgResolutionDays = sorted.length > 0
        ? (sorted.reduce((s, a) => s + (a.totalDaysOpen / a.count), 0) / sorted.length).toFixed(1)
        : '0.0';

      return { assignees: sorted, topPerformer, avgResolutionDays, activeCount, completionRate, thisWeekClosed, lastWeekClosed };
    }, [tasks]);

  // Recent activity (last 24h) grouped by assignee
  const todayAssignees = useMemo((): TodayAssignee[] => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // last 24 hours

    const map = new Map<string, TodayAssignee>();
    tasks
      .filter(t => t.assigneeLogin && new Date(t.updatedAt).getTime() >= cutoff)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .forEach(t => {
        const login = t.assigneeLogin!;
        if (!map.has(login)) {
          map.set(login, { name: login, avatar: t.assigneeAvatar, tasks: [] });
        }
        map.get(login)!.tasks.push({
          id: t.id,
          title: t.title,
          updatedAt: new Date(t.updatedAt),
          url: t.url,
          boardStatus: t.boardStatus,
        });
      });

    return Array.from(map.values()).sort((a, b) => b.tasks.length - a.tasks.length);
  }, [tasks]);

  const formatTime = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    return `${diffH}h ago`;
  };

  const getStatusTextColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('PROGRESS')) return 'text-[#3AA8F5]';
    if (s.includes('PENDING')) return 'text-[#40C5BA]';
    if (s.includes('READY') || s.includes('DEV')) return 'text-[#9D7AE4]';
    if (s.includes('REVIEW')) return 'text-[#FACA00]';
    if (s.includes('ISSUE') || s.includes('BUG')) return 'text-[#E03A30]';
    if (s.includes('DONE')) return 'text-[#21CA6E]';
    if (s.includes('TODO')) return 'text-[#A2A9B8]';
    return 'text-[#94A3B8]';
  };

  const getStatusBg = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('PROGRESS')) return 'bg-[#3AA8F5]/10 border-[#3AA8F5]/25';
    if (s.includes('PENDING')) return 'bg-[#40C5BA]/10 border-[#40C5BA]/25';
    if (s.includes('READY') || s.includes('DEV')) return 'bg-[#9D7AE4]/10 border-[#9D7AE4]/25';
    if (s.includes('REVIEW')) return 'bg-[#FACA00]/10 border-[#FACA00]/30';
    if (s.includes('ISSUE') || s.includes('BUG')) return 'bg-[#E03A30]/10 border-[#E03A30]/25';
    if (s.includes('DONE')) return 'bg-[#21CA6E]/10 border-[#21CA6E]/25';
    if (s.includes('TODO')) return 'bg-[#A2A9B8]/10 border-[#A2A9B8]/25';
    return 'bg-slate-100 border-slate-200';
  };

  const totalPages = Math.max(1, Math.ceil(assignees.length / PAGE_SIZE));
  const pageItems = assignees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const completionDelta = thisWeekClosed - lastWeekClosed;

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[600px] p-8">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">No Assignee Data</h2>
        <p className="text-slate-500 text-sm max-w-md text-center">
          There are no assigned tasks available based on your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Assignee Leaderboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Task distribution and performance across all contributors</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top Performer */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Performer</p>
              <p className="text-base font-bold text-slate-900 truncate mt-0.5">{topPerformer?.name ?? '—'}</p>
              {topPerformer && (
                <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {topPerformer.count.toLocaleString()} tasks
                </p>
              )}
            </div>
          </div>

          {/* Avg Resolution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{avgResolutionDays} <span className="text-base font-semibold text-slate-500">Days</span></p>
              <p className="text-xs text-slate-400 mt-0.5">avg across all assignees</p>
            </div>
          </div>

          {/* Active Contributors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Contributors</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeCount}</p>
              {completionDelta !== 0 && (
                <p className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${completionDelta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {completionDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {completionDelta > 0 ? '+' : ''}{completionDelta} vs last 7 days
                </p>
              )}
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0 border border-green-100">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{completionRate}<span className="text-base font-semibold text-slate-500">%</span></p>
              <p className="text-xs text-slate-400 mt-0.5">closed vs total tasks</p>
            </div>
          </div>
        </div>

        {/* Today's Activity — compact pills */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <CalendarClock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-bold text-slate-800">Today's Activity</span>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {todayAssignees.length > 0
                ? `${todayAssignees.reduce((s, a) => s + a.tasks.length, 0)} tasks · last 24h`
                : 'No recent activity'}
            </span>
          </div>

          {todayAssignees.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-5 text-slate-400">
              <CalendarClock className="w-5 h-5 text-slate-200" />
              <span className="text-sm">No tasks updated in the last 24 hours</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {todayAssignees.map(person => (
                <button
                  key={person.name}
                  onClick={() => setSelectedPerson(person)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                >
                  {person.avatar ? (
                    <img src={person.avatar} alt={person.name} className="w-5 h-5 rounded-full border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[10px] shrink-0">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">{person.name}</span>
                  <span className="text-xs font-bold text-white bg-purple-500 rounded-full px-1.5 py-0.5 leading-none">{person.tasks.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side Drawer */}
        {selectedPerson && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedPerson(null)}
            />
            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                {selectedPerson.avatar ? (
                  <img src={selectedPerson.avatar} alt={selectedPerson.name} className="w-8 h-8 rounded-full border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                    {selectedPerson.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedPerson.name}</p>
                  <p className="text-xs text-slate-400">{selectedPerson.tasks.length} task{selectedPerson.tasks.length !== 1 ? 's' : ''} · last 24h</p>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Task List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {selectedPerson.tasks.map(task => (
                  <a
                    key={task.id}
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium group-hover:text-purple-700 transition-colors leading-snug">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {task.boardStatus && (
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${getStatusBg(task.boardStatus)}`}>
                            <span className={getStatusTextColor(task.boardStatus)}>{task.boardStatus}</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{formatTime(task.updatedAt)}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500 transition-colors mt-0.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_220px_1fr_130px] gap-0 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">#</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignee</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Task Summary by Board Status</span>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Duration</span>
              <Info className="w-3 h-3 text-slate-300" />
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {pageItems.map((item, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
              const avgDays = (item.totalDaysOpen / item.count).toFixed(1);
              return (
                <div
                  key={item.name}
                  className="grid grid-cols-[40px_220px_1fr_130px] gap-0 px-4 py-3.5 hover:bg-slate-50/70 transition-colors items-center"
                >
                  {/* Rank */}
                  <span className="text-sm font-bold text-slate-400">{rank}</span>

                  {/* Assignee */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0 border border-purple-200">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <CircleDot className="w-3 h-3" />
                        <span className="font-medium text-slate-600">{item.count.toLocaleString()}</span> Tasks
                      </div>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-1.5 pr-4">
                    {Object.entries(item.statusCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([status, count]) => (
                        <button
                          key={status}
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('view', 'list');
                            params.set('assignee', item.name);
                            params.set('status', status);
                            router.push(`/?${params.toString()}`);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide cursor-pointer hover:opacity-75 transition-opacity ${getStatusBg(status)}`}
                        >
                          <span className={getStatusTextColor(status)}>{status}</span>
                          <span className="text-slate-600 font-semibold">{count}</span>
                        </button>
                      ))}
                  </div>

                  {/* Avg Duration */}
                  <div className="flex items-center justify-end gap-1.5 text-sm text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {avgDays} Days
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, assignees.length)} to {Math.min(page * PAGE_SIZE, assignees.length)} of {assignees.length} assignees
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-semibold transition-colors ${p === page
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
