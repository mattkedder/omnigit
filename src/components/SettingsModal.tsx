'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, KeyRound, ExternalLink, CheckSquare, XSquare, RefreshCw, LogOut, Search } from 'lucide-react';
import { getGitHubToken, saveGitHubToken, toggleRepository, toggleAllRepositories, fetchGitHubRepositories, clearGitHubData } from '@/actions/settings';

type Repository = {
  fullName: string;
  isActive: boolean;
};

type SettingsModalProps = {
  hasToken?: boolean;
  user?: any;
  repositories?: Repository[];
};

export default function SettingsModal({ hasToken = true, user, repositories = [] }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(!hasToken);
  const [token, setToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [repoSearchTerm, setRepoSearchTerm] = useState('');

  const filteredRepositories = repositories.filter(repo => 
    repo.fullName.toLowerCase().includes(repoSearchTerm.toLowerCase())
  );

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      getGitHubToken().then(setToken).catch(console.error);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveGitHubToken(token);
      setIsOpen(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

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
      window.location.reload();
    } catch (e) {
      alert('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await clearGitHubData();
      setIsOpen(false);
      setShowDisconnectConfirm(false);
      window.location.reload();
    } catch (e) {
      alert('Failed to disconnect');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md transition-all border border-slate-200 relative"
      >
        <img src="/github.svg" alt="GitHub" className="w-4 h-4" />
        {user ? user.login : 'Settings'}
        {!hasToken && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {mounted && isOpen && createPortal(
        !hasToken ? (
          // Center Modal for Token Required
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <img src="/github.svg" alt="GitHub" className="w-5 h-5 opacity-70" />
                  Welcome to OmniGit
                </h2>
              </div>
              
              <div className="overflow-y-auto flex-1">
                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
                    <p className="font-medium mb-2 text-blue-900">A GitHub token is required to continue.</p>
                    <p className="mb-2">OmniGit needs a GitHub Personal Access Token to securely fetch your repositories, issues, and pull requests.</p>
                    <div className="bg-white/60 p-3 rounded-lg border border-blue-100/50 mt-3">
                      <p className="font-medium text-blue-900 text-xs uppercase tracking-wider mb-1">How to get a token:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-blue-800/80">
                        <li>Go to <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">GitHub Developer Settings <ExternalLink className="w-3 h-3" /></a></li>
                        <li>Click <strong>Generate new token</strong></li>
                        <li>Give it a name (e.g., "OmniGit Local")</li>
                        <li>Select the <strong>repo</strong> scope (full control of private repositories)</li>
                        <li>Generate and paste the token below.</li>
                      </ol>
                    </div>
                  </div>

                  <form onSubmit={handleSave}>
                    <label htmlFor="token" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      GitHub Personal Access Token
                    </label>
                    <input
                      id="token"
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all focus:bg-white placeholder:text-slate-400 font-mono text-sm"
                    />
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving || !token.trim()}
                        className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all ${isSaving || !token.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSaving ? 'Saving...' : 'Save Token'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Sidebar Drawer for Settings
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
                  {/* Top Section matching templates/settings_modal.html */}
                  <section className="px-6 border-b border-slate-200 bg-white flex-shrink-0">
                    <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: User Info */}
                      <div className="flex items-center gap-3">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {user?.login || 'GitHub Account'}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Requires a <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">token</a> with <code className="bg-slate-100 border border-slate-200 px-1 rounded font-mono text-[10px]">repo</code> scope.
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setShowDisconnectConfirm(true)}
                          className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-md hover:bg-red-100 transition whitespace-nowrap"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect GitHub
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Bottom Section: Repositories */}
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
                    
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search repositories..."
                          value={repoSearchTerm}
                          onChange={(e) => setRepoSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
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
            
            {/* Disconnect Confirmation Modal */}
            {showDisconnectConfirm && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Disconnect from GitHub?</h3>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                      This action will immediately remove your Personal Access Token and permanently delete all synced repositories and tasks from the local database. You will need to re-authenticate to use OmniGit. <strong>Your actual data on GitHub will remain completely untouched.</strong>
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
                        Yes, disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ),
        document.body
      )}
    </>
  );
}
