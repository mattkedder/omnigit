'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Info, Power } from 'lucide-react';

export default function BrandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShutdown = async () => {
    if (!confirm('Are you sure you want to shut down OmniGit?')) return;
    
    try {
      await fetch('/api/shutdown', { method: 'POST' });
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#fafafa;font-family:sans-serif;color:#333;">
          <div style="width:48px;height:48px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          </div>
          <h1 style="font-size:24px;font-weight:600;margin-bottom:8px;">OmniGit is Offline</h1>
          <p style="color:#64748b;font-size:14px;">The local server has been safely shut down.</p>
          <p style="color:#64748b;font-size:14px;margin-top:4px;">You can now close this window.</p>
        </div>
      `;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 shrink-0 p-1 -ml-1 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30"
      >
        <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden shrink-0">
          <img src="/icons/icon-96x96.png" alt="OmniGit Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-[17px] font-bold text-slate-900 tracking-tight hidden md:block">OmniGit</h1>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex flex-col">
          <Link 
            href="/about" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Info className="w-4 h-4 text-slate-400" />
            About OmniGit
          </Link>
          <div className="h-px bg-slate-100 my-1"></div>
          <button 
            type="button" 
            onClick={() => {
              setIsOpen(false);
              handleShutdown();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
          >
            <Power className="w-4 h-4 text-red-500" />
            Power Off
          </button>
        </div>
      )}
    </div>
  );
}
