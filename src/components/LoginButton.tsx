'use client';

import { signIn } from 'next-auth/react';

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center justify-center gap-3 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md transition-all text-sm"
    >
      <img src="/github.svg" alt="GitHub" className="w-5 h-5 invert" />
      Sign in with GitHub
    </button>
  );
}
