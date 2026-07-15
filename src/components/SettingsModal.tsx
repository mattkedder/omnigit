'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, CheckSquare, XSquare, RefreshCw, LogOut, Search } from 'lucide-react';
import { toggleRepository, toggleAllRepositories, fetchGitHubRepositories } from '@/actions/settings';
import { signOut } from 'next-auth/react';

type Repository = {
  fullName: string;
  isActive: boolean;
};

type SettingsModalProps = {
  user?: any;
  repositories?: Repository[];
};

export default function SettingsModal({ user, repositories = [] }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [repoSearchTerm, setRepoSearchTerm] = useState('');
  const [repoFilter, setRepoFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.fullName.toLowerCase().includes(repoSearchTerm.toLowerCase());
    const matchesFilter = repoFilter === 'all' || 
                         (repoFilter === 'active' && repo.isActive) || 
                         (repoFilter === 'inactive' && !repo.isActive);
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleRepo = async (fullName: string, isActive: boolean) => {
    await toggleRepository(fullName, isActive);
  };

  const handleToggleAll = async (isActive: boolean) => {
    await toggleAllRepositories(isActive);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchGitHubRepositories();
    } catch (e) {
      alert('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (e) {
      alert('Failed to sign out');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md transition-all border border-slate-200 relative"
      >
        <img src="/github.svg" alt="GitHub" className="w-4 h-4 opacity-80" />
        {user ? (user.name || user.email) : 'Settings'}
      </button>

      {mounted && isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <img src="/github.svg" alt="GitHub" className="w-5 h-5 opacity-70" />
                OmniGit Settings
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-0 flex flex-col overflow-hidden">
                <section className="px-6 border-b border-slate-200 bg-white flex-shrink-0">
                  <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {user?.image ? (
                        <img src={user.image} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <KeyRound className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {user?.name || user?.email || 'GitHub Account'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Authenticated via NextAuth
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-md hover:bg-red-100 transition whitespace-nowrap"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </section>

                <section className="px-6 py-5 bg-slate-50 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-slate-900">Repositories</h3>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => handleToggleAll(true)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition text-xs font-medium">
                        <CheckSquare className="w-4 h-4" /> Activate All
                      </button>
                      <button type="button" onClick={() => handleToggleAll(false)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition text-xs font-medium">
                        <XSquare className="w-4 h-4" /> Deactivate All
                      </button>
                      <div className="w-px h-4 bg-slate-300"></div>
                      <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Fetch Repos'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search repositories..."
                        value={repoSearchTerm}
                        onChange={(e) => setRepoSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <select
                      value={repoFilter}
                      onChange={(e) => setRepoFilter(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-md text-sm px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  {filteredRepositories.length > 0 ? (
                    <div className="space-y-1 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                      {filteredRepositories.map(repo => (
                        <div key={repo.fullName} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200 bg-white">
                          <span className="text-sm font-medium text-slate-700">{repo.fullName}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={repo.isActive} 
                              onChange={(e) => handleToggleRepo(repo.fullName, e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white border border-slate-200 rounded-lg border-dashed">
                      <p className="text-sm text-slate-500">
                        {repositories.length === 0 ? "No repositories loaded. Click Fetch Repos." : "No repositories match your search."}
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          
          {showDisconnectConfirm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Sign Out?</h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    You are about to sign out of OmniGit. Your session will be ended.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => setShowDisconnectConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDisconnect}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  );
}
