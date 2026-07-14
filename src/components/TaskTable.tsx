'use client';

import { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import TaskDrawer from './TaskDrawer';

type TaskWithRepo = Prisma.TaskGetPayload<{
  include: { repository: true }
}>;

type TaskTableProps = {
  tasks: TaskWithRepo[];
  page: number;
  searchParams: Record<string, string>;
};

export default function TaskTable({ tasks, page, searchParams }: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithRepo | null>(null);

  const getSortUrl = (field: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get('sort');
    const currentOrder = params.get('order');

    params.set('sort', field);
    if (currentSort === field && currentOrder === 'asc') {
      params.set('order', 'desc');
    } else {
      params.set('order', 'asc');
    }
    return `/?${params.toString()}`;
  };

  const renderSortIcon = (field: string) => {
    if (searchParams.sort === field) {
      return <span className="text-purple-600 ml-1">{searchParams.order === 'asc' ? '↑' : '↓'}</span>;
    }
    return null;
  };

  const getBoardStatusStyle = (status: string | null) => {
    const s = (status || '').toUpperCase();
    if (s.includes('PROGRESS')) return 'bg-[#3AA8F5]'; // Blue
    if (s.includes('PENDING')) return 'bg-[#40C5BA]'; // Teal
    if (s.includes('READY') || s.includes('DEV')) return 'bg-[#9D7AE4]'; // Purple
    if (s.includes('REVIEW')) return 'bg-[#FACA00]'; // Yellow
    if (s.includes('ISSUE') || s.includes('BUG')) return 'bg-[#E03A30]'; // Red
    if (s.includes('DONE')) return 'bg-[#21CA6E]'; // Green
    if (s.includes('TODO')) return 'bg-[#A2A9B8]'; // Gray
    return 'bg-[#94A3B8]'; // Default slate-400
  };

  return (
    <div className="w-full bg-white flex-1 flex flex-col">
      <div className="overflow-x-auto border-b border-slate-200">
        <table className="w-full text-[13px] whitespace-nowrap table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left font-semibold text-slate-500 tracking-wide bg-white">
              <th className="px-4 py-3 border-r border-slate-200 w-12 text-center text-slate-400 font-medium">#</th>
              <th className="px-4 py-3 border-r border-slate-200 w-[450px]">
                <Link href={getSortUrl('title')} className="flex items-center gap-1.5 hover:text-slate-900 transition">
                  <Check className="w-4 h-4 text-slate-400" /> Task {renderSortIcon('title')}
                </Link>
              </th>
              {/* Blank header for status badges */}
              <th className="px-4 py-3 border-r border-slate-200 w-32">
                <Link href={getSortUrl('boardStatus')} className="flex items-center hover:text-slate-900 transition">
                  Board {renderSortIcon('boardStatus')}
                </Link>
              </th>
              <th className="px-4 py-3 border-r border-slate-200 w-36">
                <Link href={getSortUrl('updatedAt')} className="flex items-center hover:text-slate-900 transition">
                  Updated Date {renderSortIcon('updatedAt')}
                </Link>
              </th>
              <th className="px-4 py-3 border-r border-slate-200 w-24">Assignee</th>
              <th className="px-4 py-3 border-r border-slate-200 w-64">Repository / Note</th>
              <th className="px-4 py-3 border-r border-slate-200 w-24">State</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                  No tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => {
                let parsedLabels: any[] = [];
                try {
                  if (task.labels) parsedLabels = JSON.parse(task.labels);
                } catch (e) { }

                const isStale = task.state.toLowerCase() === 'open' && (new Date().getTime() - new Date(task.updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-slate-50/50 transition cursor-pointer border-b border-slate-200"
                  >
                    <td className="px-4 py-3 border-r border-slate-200 text-center text-slate-500 font-medium w-12">
                      {index + 1 + (page - 1) * 20}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-700 font-medium truncate max-w-[400px] block" title={task.title}>{task.title}</span>
                        {parsedLabels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {parsedLabels.map((l: any, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 max-w-[120px]"
                                title={l.name}
                              >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: `#${l.color || 'ccc'}` }}></span>
                                <span className="truncate">{l.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      {task.boardStatus && (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider ${getBoardStatusStyle(task.boardStatus)}`}>
                          {task.boardStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={isStale ? "text-red-500 font-semibold" : "text-slate-600"}>
                          {task.updatedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isStale && <span title="Task hasn't been updated in over 7 days"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /></span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      {task.assigneeAvatar ? (
                        <div className="flex items-center gap-1.5">
                          <img src={task.assigneeAvatar} alt="avatar" className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0" />
                          <span className="text-slate-600 text-xs truncate">{task.assigneeLogin || 'Assignee'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-slate-600 truncate">
                      {task.repository.fullName}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {task.state === 'open' ? (
                          <span className="text-[10px] uppercase font-semibold text-slate-500">Open</span>
                        ) : (
                          <span className="text-[10px] uppercase font-semibold text-slate-400">Closed</span>
                        )}
                        {task.type === 'pull_request' && (
                          <span className="text-[10px] uppercase font-semibold text-slate-500">PR</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Pad with empty rows if fewer than 15 tasks to maintain grid look */}
            {tasks.length > 0 && tasks.length < 15 && (
              Array.from({ length: 15 - tasks.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200 bg-white h-11">
                  <td className="px-4 border-r border-slate-200 w-12"></td>
                  <td className="px-4 border-r border-slate-200"></td>
                  <td className="px-4 border-r border-slate-200"></td>
                  <td className="px-4 border-r border-slate-200"></td>
                  <td className="px-4 border-r border-slate-200"></td>
                  <td className="px-4 border-r border-slate-200"></td>
                  <td className="px-4 border-r border-slate-200"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
