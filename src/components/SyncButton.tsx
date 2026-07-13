'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { syncAllRepositories } from '@/actions/sync';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllRepositories();
    } catch (e) {
      console.error(e);
      alert('Sync failed. Please ensure your GitHub token is valid.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition-all border border-slate-200 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync'}
    </button>
  );
}
