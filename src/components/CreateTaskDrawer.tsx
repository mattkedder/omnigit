'use client';

import { useState, useRef, useEffect } from 'react';
import { X, PlusCircle, ArrowRight, Search, ChevronDown, Check } from 'lucide-react';
import { createTask } from '@/actions/tasks';

type CreateTaskDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  repos: { fullName: string }[];
};

const DEFAULT_TEMPLATE = `### About
[Provide a brief description of the task or issue here]

### Expected Result
[Describe what the successful completion of this task looks like]`;

export default function CreateTaskDrawer({ isOpen, onClose, repos }: CreateTaskDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repo, setRepo] = useState('');
  const [repoSearch, setRepoSearch] = useState('');
  const [repoOpen, setRepoOpen] = useState(false);
  const repoRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(DEFAULT_TEMPLATE);
  const [label, setLabel] = useState('');

  const LABELS = ['bug', 'enhancement', 'documentation', 'help wanted', 'product iteration'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (repoRef.current && !repoRef.current.contains(event.target as Node)) {
        setRepoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repo) {
      alert('Please select a repository');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTask(repo, title, body, label);
      setTitle('');
      setBody(DEFAULT_TEMPLATE);
      setLabel('');
      onClose();
    } catch (err: any) {
      alert(`Failed to create task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredRepos = repos.filter(r => r.fullName.toLowerCase().includes(repoSearch.toLowerCase()));

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-2/3 md:w-1/2 lg:w-2/5 bg-white border-l border-slate-200 z-[250] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-purple-600" /> New Task
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 bg-white hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="space-y-6 flex-1">
            
            <div className="relative" ref={repoRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Repository <span className="text-red-500">*</span></label>
              <div 
                onClick={() => setRepoOpen(!repoOpen)}
                className={`w-full bg-slate-50 border ${repoOpen ? 'border-purple-500 ring-2 ring-purple-500/20 bg-white' : 'border-slate-200'} rounded-lg px-3 py-2.5 text-sm text-slate-900 cursor-pointer flex items-center justify-between transition-all`}
              >
                <span className={repo ? 'text-slate-900' : 'text-slate-400'}>{repo || 'Select repository...'}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${repoOpen ? 'rotate-180' : ''}`} />
              </div>

              {repoOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-white border border-slate-200 shadow-xl rounded-lg z-50 overflow-hidden flex flex-col max-h-[250px] animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search repositories..."
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        className="w-full text-sm pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1 custom-scrollbar flex-1">
                    {filteredRepos.length > 0 ? filteredRepos.map(r => (
                      <div
                        key={r.fullName}
                        onClick={() => { setRepo(r.fullName); setRepoOpen(false); setRepoSearch(''); }}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${repo === r.fullName ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
                      >
                        {r.fullName}
                        {repo === r.fullName && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                    )) : (
                      <div className="px-3 py-4 text-sm text-slate-500 text-center">No repositories found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                id="title" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all focus:bg-white placeholder:text-slate-400"
                placeholder="E.g., Implement new user onboarding flow" 
              />
            </div>

            <div>
              <label htmlFor="label" className="block text-sm font-semibold text-slate-700 mb-1">Label</label>
              <select
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all focus:bg-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
              >
                <option value="">No Label</option>
                {LABELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col min-h-[250px]">
              <label htmlFor="body" className="block text-sm font-semibold text-slate-700 mb-1">Description (Markdown)</label>
              <textarea 
                id="body" 
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono resize-none focus:bg-white leading-relaxed"
              />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end flex-shrink-0 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 mr-2 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-purple-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
