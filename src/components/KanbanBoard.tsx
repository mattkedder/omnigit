'use client';

import { useState } from 'react';
import { Prisma } from '@prisma/client';
import TaskDrawer from './TaskDrawer';
import { AlertTriangle, Sparkles } from 'lucide-react';

type TaskWithRepo = Prisma.TaskGetPayload<{
  include: { repository: true }
}>;

type KanbanBoardProps = {
  tasks: TaskWithRepo[];
  boardStatuses: string[];
};

export default function KanbanBoard({ tasks, boardStatuses }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithRepo | null>(null);

  // Group tasks by boardStatus
  const groupedTasks = boardStatuses.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.boardStatus === status);
    return acc;
  }, {} as Record<string, TaskWithRepo[]>);

  // Add an "Uncategorized" or empty status column if there are any
  const uncategorizedTasks = tasks.filter(t => !t.boardStatus || !boardStatuses.includes(t.boardStatus));
  if (uncategorizedTasks.length > 0) {
    groupedTasks['Uncategorized'] = uncategorizedTasks;
  }

  const columns = Object.keys(groupedTasks);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'bg-slate-200 text-slate-700';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      case 'Uncategorized': return 'bg-gray-100 text-gray-700';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="w-full flex-1 overflow-x-auto bg-slate-50 p-6 min-h-[600px] relative">
      {tasks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-8">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-purple-100 relative">
              <div className="absolute -inset-4 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
              <Sparkles className="w-10 h-10 text-purple-600 relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight text-center">Inbox Zero! 🎉</h3>
            <p className="text-base text-slate-500 leading-relaxed text-center">
              Your board is completely clear. You're all caught up!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 h-full items-start w-max">
          {columns.map(status => (
          <div key={status} className="w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
                  {status}
                </span>
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {groupedTasks[status].length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {groupedTasks[status].map(task => {
                let parsedLabels: any[] = [];
                try {
                  if (task.labels) parsedLabels = JSON.parse(task.labels);
                } catch (e) {}

                const isStale = task.state.toLowerCase() === 'open' && (new Date().getTime() - new Date(task.updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;

                return (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`border rounded-lg p-3 cursor-pointer flex flex-col gap-2 transition-colors ${isStale ? 'bg-red-50/50 border-red-200 hover:bg-red-50' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500 truncate flex items-center gap-1.5">
                        {task.repository.fullName} #{task.number}
                        {isStale && <span title="Task hasn't been updated in over 7 days"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /></span>}
                      </span>
                      {task.assigneeAvatar ? (
                        <img src={task.assigneeAvatar} alt="avatar" className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex-shrink-0" />
                      )}
                    </div>
                    
                    <h4 className="text-sm font-medium text-slate-900 leading-snug">{task.title}</h4>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {task.type === 'pull_request' ? (
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">PR</span>
                      ) : (
                        <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">ISSUE</span>
                      )}
                      
                      {parsedLabels.slice(0, 3).map((l: any) => (
                        <span key={l.name} className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 truncate max-w-[100px]">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: `#${l.color}` }}></span>
                          <span className="truncate">{l.name}</span>
                        </span>
                      ))}
                      {parsedLabels.length > 3 && (
                        <span className="text-[9px] font-medium text-slate-400">+{parsedLabels.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {groupedTasks[status].length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                  <span className="text-xs text-slate-400 font-medium">No tasks</span>
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
      )}

      <TaskDrawer 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
