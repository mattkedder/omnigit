'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { KeyRound, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginButton() {
  const [pat, setPat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const router = useRouter();

  // Auto-hide snackbar after 4 seconds
  useEffect(() => {
    if (error) {
      setShowSnackbar(true);
      const timer = setTimeout(() => setShowSnackbar(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handlePATLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSnackbar(false);
    
    const trimmedPat = pat.trim();
    if (!trimmedPat) return;
    
    if (!trimmedPat.startsWith('ghp_') && !trimmedPat.startsWith('github_pat_')) {
      setError('Invalid format. Must start with ghp_ or github_pat_');
      return;
    }

    setIsLoading(true);
    const res = await signIn('credentials', { 
      pat: trimmedPat, 
      redirect: false 
    });
    
    if (res?.error) {
      setError('Invalid Personal Access Token');
      setIsLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-5 relative">
        <button
          onClick={() => signIn('github')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="/github.svg" alt="GitHub" className="w-5 h-5 invert" />
          Sign in with GitHub
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold tracking-wider uppercase">Or</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        <form onSubmit={handlePATLogin} className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-slate-700">Personal Access Token</label>
            <Link 
              href="/security"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Is my token secure?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="password"
              placeholder="Paste Personal Access Token..."
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm font-mono disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !pat.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all shadow-sm border border-slate-200 text-sm disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : (
              <>
                Sign in with PAT
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Animated Snackbar */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
          showSnackbar ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-red-50 border border-red-200 shadow-xl rounded-2xl px-5 py-3.5 flex items-center gap-3 text-sm font-semibold text-red-800 min-w-[320px]">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          {error}
        </div>
      </div>
    </>
  );
}
