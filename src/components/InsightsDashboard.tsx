'use client';

import { Prisma } from '@prisma/client';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart3, PieChart, Users, FolderKanban, Clock, CircleDot, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type TaskWithRepo = Prisma.TaskGetPayload<{
  include: { repository: true }
}>;

type InsightsProps = {
  tasks: TaskWithRepo[];
};

type AssigneeData = {
  count: number;
  avatar: string | null;
  statusCounts: Record<string, number>;
  totalDaysOpen: number;
};

export default function InsightsDashboard({ tasks }: InsightsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Compute Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    
    // Status Distribution
    const statusMap = new Map<string, number>();
    // Repo Distribution
    const repoMap = new Map<string, number>();
    // Assignee Distribution
    const assigneeMap = new Map<string, AssigneeData>();

    const now = new Date().getTime();
    let velocityThisWeek = 0;
    let velocityLastWeek = 0;

    tasks.forEach(task => {
      const updatedAt = new Date(task.updatedAt).getTime();
      const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);

      if (task.state.toLowerCase() === 'closed') {
        if (daysSinceUpdate <= 7) {
          velocityThisWeek++;
        } else if (daysSinceUpdate > 7 && daysSinceUpdate <= 14) {
          velocityLastWeek++;
        }
      }

      // Status
      const status = task.boardStatus || 'No Status';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);

      // Repo
      const repo = task.repository.name;
      repoMap.set(repo, (repoMap.get(repo) || 0) + 1);

      // Assignee
      const assignee = task.assigneeLogin || 'Unassigned';
      if (!assigneeMap.has(assignee)) {
        assigneeMap.set(assignee, { count: 0, avatar: task.assigneeAvatar, statusCounts: {}, totalDaysOpen: 0 });
      }
      
      const aData = assigneeMap.get(assignee)!;
      aData.count++;
      aData.statusCounts[status] = (aData.statusCounts[status] || 0) + 1;
      
      const daysOpen = (now - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      aData.totalDaysOpen += daysOpen;
    });

    const sortMap = (map: Map<string, any>, isAssignee = false) => {
      return Array.from(map.entries())
        .map(([name, val]) => isAssignee ? { name, ...val } : { name, count: val as number })
        .sort((a: any, b: any) => b.count - a.count);
    };

    return {
      total,
      statuses: sortMap(statusMap),
      repos: sortMap(repoMap),
      assignees: sortMap(assigneeMap, true) as (AssigneeData & { name: string })[],
      velocityThisWeek,
      velocityLastWeek,
    };
  }, [tasks]);

  const getStatusColor = (status: string, isPill: boolean = false) => {
    const s = status.toUpperCase();
    if (s.includes('PROGRESS')) return isPill ? 'bg-[#3AA8F5]/10 border-[#3AA8F5]/20' : 'bg-[#3AA8F5]';
    if (s.includes('PENDING')) return isPill ? 'bg-[#40C5BA]/10 border-[#40C5BA]/20' : 'bg-[#40C5BA]';
    if (s.includes('READY') || s.includes('DEV')) return isPill ? 'bg-[#9D7AE4]/10 border-[#9D7AE4]/20' : 'bg-[#9D7AE4]';
    if (s.includes('REVIEW')) return isPill ? 'bg-[#FACA00]/10 border-[#FACA00]/20' : 'bg-[#FACA00]';
    if (s.includes('ISSUE') || s.includes('BUG')) return isPill ? 'bg-[#E03A30]/10 border-[#E03A30]/20' : 'bg-[#E03A30]';
    if (s.includes('DONE')) return isPill ? 'bg-[#21CA6E]/10 border-[#21CA6E]/20' : 'bg-[#21CA6E]';
    if (s.includes('TODO')) return isPill ? 'bg-[#A2A9B8]/10 border-[#A2A9B8]/20' : 'bg-[#A2A9B8]';
    return isPill ? 'bg-[#94A3B8]/10 border-[#94A3B8]/20' : 'bg-[#94A3B8]'; // Default
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
    return 'text-[#94A3B8]'; // Default
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[600px] p-8">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">No Data Available</h2>
        <p className="text-slate-500 text-sm max-w-md text-center">
          There are no tasks available to generate insights based on your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repositories</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.repos.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Assignees</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.assignees.filter(a => a.name !== 'Unassigned').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col justify-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Velocity (7d)</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl font-bold text-slate-800">{stats.velocityThisWeek}</p>
                  {stats.velocityThisWeek > stats.velocityLastWeek ? (
                    <div className="flex items-center text-xs font-bold text-green-500 mb-1" title={`${stats.velocityThisWeek} vs ${stats.velocityLastWeek} last week`}>
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      +{Math.round(((stats.velocityThisWeek - stats.velocityLastWeek) / (stats.velocityLastWeek || 1)) * 100)}%
                    </div>
                  ) : stats.velocityThisWeek < stats.velocityLastWeek ? (
                    <div className="flex items-center text-xs font-bold text-red-500 mb-1" title={`${stats.velocityThisWeek} vs ${stats.velocityLastWeek} last week`}>
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      {Math.round(((stats.velocityThisWeek - stats.velocityLastWeek) / stats.velocityLastWeek) * 100)}%
                    </div>
                  ) : (
                    <div className="flex items-center text-xs font-bold text-slate-400 mb-1" title={`Same as last week (${stats.velocityLastWeek})`}>
                      <Minus className="w-3 h-3 mr-0.5" />
                      0%
                    </div>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Distribution */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Status Distribution</h3>
            </div>
            
            <div className="space-y-4">
              {stats.statuses.map((item) => {
                const percentage = Math.round((item.count / stats.total) * 100);
                const colorClass = getStatusColor(item.name);
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="text-slate-500 font-semibold">{item.count} <span className="font-normal text-slate-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repository Workload */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <FolderKanban className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Repository Workload</h3>
            </div>
            
            <div className="space-y-4">
              {stats.repos.map((item) => {
                const percentage = Math.round((item.count / stats.total) * 100);
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 truncate max-w-[70%]">{item.name}</span>
                      <span className="text-slate-500 font-semibold">{item.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignee Leaderboard */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Assignee Leaderboard</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {stats.assignees.map((item, index) => {
                const avgDays = Math.round(item.totalDaysOpen / item.count);
                return (
                  <div key={item.name} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="text-lg font-bold text-slate-300 w-6 text-center">{index + 1}</div>
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl border border-slate-200">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                          <CircleDot className="w-3.5 h-3.5" />
                          <span className="font-medium text-slate-700">{item.count}</span> Tasks
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block w-px h-10 bg-slate-200 mx-2"></div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.statusCounts)
                          .sort(([, countA], [, countB]) => countB - countA)
                          .map(([status, count]) => {
                            const pillColor = getStatusColor(status, true);
                            const textColor = getStatusTextColor(status);
                            
                            const handlePillClick = () => {
                              const params = new URLSearchParams(searchParams.toString());
                              params.set('view', 'list');
                              params.set('assignee', item.name);
                              params.set('status', status);
                              router.push(`/?${params.toString()}`);
                            };

                            return (
                              <div 
                                key={status} 
                                onClick={handlePillClick}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${pillColor} cursor-pointer hover:opacity-80 transition-opacity`}
                              >
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>{status}</span>
                                <span className="text-xs font-semibold text-slate-700">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    
                    <div className="hidden sm:block w-px h-10 bg-slate-200 mx-2"></div>
                    
                    <div className="flex flex-col sm:items-end min-w-[120px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Duration</span>
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {avgDays} {avgDays === 1 ? 'Day' : 'Days'}
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
