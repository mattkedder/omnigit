'use client';

import { useState } from 'react';
import { X, PlusCircle, ArrowRight } from 'lucide-react';
import { createTask } from '@/actions/tasks';

type CreateTaskDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  repos: { fullName: string }[];
};

export default function CreateTaskDrawer({ isOpen, onClose, repos }: CreateTaskDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repo, setRepo] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(`### Problem Statement\n[Describe the problem or opportunity here]\n\n### Proposed Solution\n[Describe the intended solution or feature]\n\n### Success Metrics\n[How will we know this is successful?]`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTask(repo, title, body);
      setTitle('');
      setBody(`### Problem Statement\n[Describe the problem or opportunity here]\n\n### Proposed Solution\n[Describe the intended solution or feature]\n\n### Success Metrics\n[How will we know this is successful?]`);
      onClose();
    } catch (err: any) {
      alert(`Failed to create task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-2/3 md:w-1/2 lg:w-2/5 bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-600" /> New Product Task
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="space-y-5 flex-1">
            <div>
              <label htmlFor="repo" className="block text-sm font-semibold text-slate-700 mb-1">Repository <span className="text-red-500">*</span></label>
              <select
                id="repo"
                required
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all focus:bg-white"
              >
                <option value="" disabled>Select repository...</option>
                {repos.map(r => (
                  <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Select the destination repository.</p>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                id="title" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all focus:bg-white placeholder:text-slate-400"
                placeholder="E.g., Implement new user onboarding flow" 
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">
              <label htmlFor="body" className="block text-sm font-semibold text-slate-700 mb-1">Description (Markdown)</label>
              <textarea 
                id="body" 
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono resize-none focus:bg-white"
              />
              <p className="text-xs text-slate-500 mt-2">This task will automatically be tagged with <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">product iteration</span>.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 mr-2 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
