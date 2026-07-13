'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Plus, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import CreateTaskDrawer from './CreateTaskDrawer';

type FilterBarProps = {
  repos: { fullName: string }[];
  boardStatuses: string[];
  labelNames: string[];
  assignees: { login: string; avatar: string | null }[];
  milestones: string[];
};

export default function FilterBar({ repos, boardStatuses, labelNames, assignees, milestones }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('q', search);
  };

  const clearFilters = () => {
    const view = searchParams.get('view');
    router.push(view ? `/?view=${view}` : '/');
    setSearch('');
  };

  // Only count actual filters (exclude view, sort, order, page)
  const hasFilters = Array.from(searchParams.keys()).some(k => !['sort', 'order', 'page', 'view'].includes(k));

  const selectClassName = "h-8 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_6px_center] bg-no-repeat flex-1 sm:flex-none w-[calc(50%-4px)] sm:w-auto min-w-[120px]";

  // Custom Searchable Dropdown for Repositories
  const [repoOpen, setRepoOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const repoRef = useRef<HTMLDivElement>(null);
  // Custom Dropdown for Assignees
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (repoRef.current && !repoRef.current.contains(event.target as Node)) {
        setRepoOpen(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setAssigneeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRepos = repos.filter(r => r.fullName.toLowerCase().includes(repoSearch.toLowerCase()));
  const currentRepo = searchParams.get('repo') || '';

  return (
    <div className="w-full flex flex-col xl:flex-row items-start xl:items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 gap-3">

      {/* Left Side: Filter Label and Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 w-full">

        {/* Search and Mobile Toggle Row */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium text-sm mr-1 shrink-0">
            <Filter className="w-4 h-4" /> <span className="hidden md:inline">Filter</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative group flex-1 sm:w-auto sm:flex-none">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-8 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors w-full sm:w-40 sm:focus:w-56"
            />
          </form>

          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`sm:hidden h-8 px-3 text-xs font-medium border rounded-md transition-colors flex items-center justify-center gap-1.5 shrink-0 ${showMobileFilters ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>

        {/* Advanced Filters (Collapsible on Mobile) */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0`}>
          <div className="relative flex-1 sm:flex-none w-[calc(50%-4px)] sm:w-auto min-w-[120px]" ref={repoRef}>
            <div
              onClick={() => setRepoOpen(!repoOpen)}
              className="h-8 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-2 w-full sm:max-w-[200px]"
            >
              <span className="truncate">{currentRepo || 'Repository'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>

            {repoOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-md z-50 overflow-hidden flex flex-col max-h-[300px]">
                <div className="p-2 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search repos..."
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      className="w-full text-xs pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto overflow-x-hidden flex-1 p-1 custom-scrollbar">
                  <div
                    onClick={() => { handleFilterChange('repo', ''); setRepoOpen(false); }}
                    className={`px-2.5 py-1.5 text-xs rounded-sm cursor-pointer truncate ${!currentRepo ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    All Repositories
                  </div>
                  {filteredRepos.map(r => (
                    <div
                      key={r.fullName}
                      onClick={() => { handleFilterChange('repo', r.fullName); setRepoOpen(false); }}
                      className={`px-2.5 py-1.5 text-xs rounded-sm cursor-pointer truncate ${currentRepo === r.fullName ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {r.fullName}
                    </div>
                  ))}
                  {filteredRepos.length === 0 && (
                    <div className="px-2.5 py-3 text-xs text-slate-400 text-center">No matches found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <select
            value={searchParams.get('state') || ''}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className={selectClassName}
          >
            <option value="">State</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={searchParams.get('status') || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={selectClassName}
          >
            <option value="">Board Status</option>
            {boardStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Custom Assignee Dropdown */}
          <div className="relative flex-1 sm:flex-none w-[calc(50%-4px)] sm:w-auto min-w-[120px]" ref={assigneeRef}>
            <div
              onClick={() => setAssigneeOpen(!assigneeOpen)}
              className="h-8 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-2 w-full sm:max-w-[200px]"
            >
              <span className="truncate">{searchParams.get('assignee') || 'Assignee'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>

            {assigneeOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-md z-50 overflow-hidden flex flex-col max-h-[300px]">
                <div className="overflow-y-auto overflow-x-hidden flex-1 p-1 custom-scrollbar">
                  <div
                    onClick={() => { handleFilterChange('assignee', ''); setAssigneeOpen(false); }}
                    className={`px-2.5 py-2 text-xs rounded-sm cursor-pointer truncate flex items-center gap-2 ${!searchParams.get('assignee') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Filter className="w-3 h-3 text-slate-400" />
                    </div>
                    All Assignees
                  </div>
                  <div
                    onClick={() => { handleFilterChange('assignee', 'Unassigned'); setAssigneeOpen(false); }}
                    className={`px-2.5 py-2 text-xs rounded-sm cursor-pointer truncate flex items-center gap-2 ${searchParams.get('assignee') === 'Unassigned' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] flex-shrink-0">
                      ?
                    </div>
                    Unassigned
                  </div>
                  {assignees.map(a => (
                    <div
                      key={a.login}
                      onClick={() => { handleFilterChange('assignee', a.login); setAssigneeOpen(false); }}
                      className={`px-2.5 py-2 text-xs rounded-sm cursor-pointer truncate flex items-center gap-2 ${searchParams.get('assignee') === a.login ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {a.avatar ? (
                        <img src={a.avatar} alt={a.login} className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] flex-shrink-0">
                          {a.login.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {a.login}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select
            value={searchParams.get('label') || ''}
            onChange={(e) => handleFilterChange('label', e.target.value)}
            className={selectClassName}
          >
            <option value="">Label</option>
            {labelNames.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={searchParams.get('milestone') || ''}
            onChange={(e) => handleFilterChange('milestone', e.target.value)}
            className={selectClassName}
          >
            <option value="">Milestone</option>
            <option value="No Milestone">No Milestone</option>
            {milestones.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={`${searchParams.get('sort') || 'updatedAt'}-${searchParams.get('order') || 'desc'}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              const params = new URLSearchParams(searchParams.toString());
              params.set('sort', sort);
              params.set('order', order);
              router.push(`/?${params.toString()}`);
            }}
            className={selectClassName}
          >
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="boardStatus-asc">Status</option>
          </select>

          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-50 transition-colors ml-1" title="Clear Filters">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3 xl:ml-auto">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="fixed bottom-6 right-6 z-50 xl:static xl:bottom-auto xl:right-auto xl:z-auto h-14 w-14 xl:h-8 xl:w-auto xl:px-3 text-white xl:text-slate-600 bg-purple-600 xl:bg-white border-none xl:border xl:border-slate-200 rounded-full xl:rounded-md hover:bg-purple-700 xl:hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-purple-500/30 xl:focus:ring-2 xl:focus:ring-purple-500/50 transition-all flex items-center justify-center gap-1.5 shadow-xl shadow-purple-500/20 xl:shadow-none"
        >
          <Plus className="w-6 h-6 xl:w-3.5 xl:h-3.5 xl:text-slate-400" />
          <span className="hidden xl:inline text-xs font-medium">Task</span>
        </button>
      </div>

      <CreateTaskDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        repos={repos}
      />
    </div>
  );
}
