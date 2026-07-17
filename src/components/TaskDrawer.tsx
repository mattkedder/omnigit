'use client';

import { X, ExternalLink, Hash, Folder, Calendar, CalendarCheck, Milestone, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { Prisma } from '@prisma/client';
import { useState } from 'react';
import { closeTask } from '@/actions/tasks';

type TaskWithRepo = Prisma.TaskGetPayload<{
  include: { repository: true }
}>;

type TaskDrawerProps = {
  task: TaskWithRepo | null;
  onClose: () => void;
};

export default function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!task) return null;

  let parsedLabels: any[] = [];
  try {
    if (task.labels) parsedLabels = JSON.parse(task.labels);
  } catch (e) { }

  const getBoardStatusColor = (status: string | null) => {
    switch (status) {
      case 'Todo': return 'bg-gray-400';
      case 'In Progress': return 'bg-blue-400';
      case 'Done': return 'bg-green-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-1/2 bg-white border-l border-gray-200 z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">

        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[50%] line-clamp-1">#{task.number}</h1>
          <div className="flex items-center gap-4">
            {task.assigneeAvatar ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <img src={task.assigneeAvatar} alt="avatar" className="w-6 h-6 rounded-full border border-gray-200" />
                <span className="font-medium">{task.assigneeLogin}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No assignee</span>
            )}

            <a href={task.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition font-medium">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.05.58 1.2.87.72 1.2 1.87.84 2.33.63.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Open in GitHub <ExternalLink className="w-4 h-4" />
            </a>

            {task.state === 'open' && (
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to close this issue?')) {
                    setIsClosing(true);
                    try {
                      await closeTask(task.id);
                      onClose(); // optionally close drawer after closing
                    } catch (e) {
                      alert('Failed to close issue');
                    } finally {
                      setIsClosing(false);
                    }
                  }
                }}
                disabled={isClosing}
                className="flex text-xs items-center gap-1.5 text-gray-400 hover:text-red-600 transition font-medium disabled:opacity-50"
              >
                <CheckCircle className={`w-4 h-4 ${isClosing ? 'animate-spin' : ''}`} /> {isClosing ? 'Closing...' : 'Close Issue'}
              </button>
            )}

            <div className="h-4 w-px bg-gray-200"></div>

            <button onClick={onClose} className="flex text-xs items-center gap-1 text-gray-400 hover:text-gray-600 leading-none">
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
          <div className="flex items-center flex-wrap gap-2">
            {/* <span className="text-xs font-semibold text-gray-500">{task.repository.fullName}</span> */}

            {task.type === 'pull_request' ? (
              <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">PR</span>
            ) : (
              <span className="inline-block bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">ISSUE</span>
            )}

            {task.state === 'open' ? (
              <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">OPEN</span>
            ) : (
              <span className="inline-block bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">CLOSED</span>
            )}

            {task.boardStatus && (
              <div className="w-px h-3 bg-gray-300 mx-1"></div>
            )}

            {task.boardStatus && (
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider ${getBoardStatusColor(task.boardStatus)}`}>
                {task.boardStatus}
              </span>
            )}

            {parsedLabels.length > 0 && (
              <div className="flex items-center flex-wrap gap-1.5">
                {parsedLabels.map((l: any) => (
                  <span key={l.name} className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `#${l.color}` }}></span>
                    {l.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {task.milestone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Milestone className="w-3.5 h-3.5" />
              <span className="font-medium">{task.milestone}</span>
            </div>
          )}

          <div className="flex items-center gap-6 text-xs border-t border-gray-200 pt-3">
            <div className="flex items-center gap-1">
              <span className="text-gray-400"><Hash className="w-4 h-4" /></span>
              <span className="font-medium ml-1">{task.number}</span>
            </div>
            <a 
              href={`https://github.com/${task.repository.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer group"
              title="Open Repository in GitHub"
            >
              <span className="text-gray-400 group-hover:text-blue-500 transition-colors"><Folder className="w-4 h-4" /></span>
              <span className="font-medium ml-1">{task.repository.name}</span>
            </a>
            <div className="flex items-center gap-1">
              <span className="text-gray-400"><Calendar className="w-4 h-4" /></span>
              <span className="font-medium ml-1">{task.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400"><CalendarCheck className="w-4 h-4" /></span>
              <span className="font-medium ml-1">{task.updatedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            {task.body ? (
              <div className="text-sm text-gray-700 leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-2 [&_a]:text-blue-600 [&_a]:underline [&_p]:my-1 [&_hr]:my-3 [&_hr]:border-gray-200 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:border [&_img]:border-gray-200 [&_img]:my-3 [&_img]:mx-auto [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-left [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    img: ({node, ...props}) => <img {...props} referrerPolicy="no-referrer" />
                  }}
                >
                  {task.body}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No description provided.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
