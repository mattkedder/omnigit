'use client';

import { useState } from 'react';
import { KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { saveUserPAT } from '@/actions/settings';

export default function TokenDialog({ hasStoredPAT }: { hasStoredPAT: boolean }) {
  const [isOpen, setIsOpen] = useState(!hasStoredPAT);
  const [pat, setPat] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!pat.trim() || !pat.startsWith('ghp_')) {
      setError('Please enter a valid classic Personal Access Token starting with "ghp_".');
      return;
    }

    setIsSaving(true);
    try {
      await saveUserPAT(pat.trim());
      setIsOpen(false);
    } catch (err) {
      setError('Failed to save the token. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-purple-200/60">
            <KeyRound className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organization Access Required</h2>
            <p className="text-sm text-slate-500 font-medium">Please provide a Personal Access Token</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="text-slate-600 text-sm leading-relaxed">
            Your GitHub OAuth login lacks access to repositories from organizations with strict Third-Party Application Restrictions. 
            To bypass this and sync all your repositories, you need to provide a classic Personal Access Token.
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
            <p>
              Your token is stored safely in your local SQLite database and never leaves your machine. 
              <br className="mb-2" />
              Make sure to generate a classic PAT with the <strong>repo</strong> scope.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pat" className="text-sm font-semibold text-slate-700">Personal Access Token</label>
            <input
              id="pat"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all shadow-sm font-mono text-sm"
              required
            />
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Token & Continue'}
              {!isSaving && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
