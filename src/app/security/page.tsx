import Link from 'next/link';
import { ArrowLeft, ShieldCheck, KeyRound, Database, Lock } from 'lucide-react';

export const metadata = {
  title: 'Token Security | OmniGit',
  description: 'Learn how OmniGit secures your Personal Access Token.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-purple-100 flex justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5">
              <ShieldCheck className="w-64 h-64" />
            </div>
            <div className="relative z-10 flex items-center gap-4 text-white mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Token Security</h1>
            </div>
            <p className="text-slate-300 text-lg max-w-xl relative z-10">
              Understanding why OmniGit uses Personal Access Tokens and how we guarantee your data's safety.
            </p>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Why do we need a Token?</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                By default, OmniGit offers a seamless <strong>"Sign in with GitHub"</strong> (OAuth) experience. However, many enterprise organizations enforce strict <strong>Third-Party Application Restrictions</strong>, which silently block OAuth apps from accessing their private repositories.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By providing a classic Personal Access Token (PAT) with the <code>repo</code> scope, OmniGit can completely bypass these restrictions and act on your behalf, ensuring you can manage <em>all</em> your repositories in one central dashboard.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Database className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Zero Database Storage</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Because OmniGit is designed to be hosted on Virtual Private Servers (VPS), we enforce a strict <strong>Zero Database Storage</strong> policy for Personal Access Tokens.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 leading-relaxed shadow-sm">
                If the server hosting OmniGit was ever compromised, and an attacker downloaded the entire database, they would find <strong>zero tokens</strong>. Your raw token never touches our database or the server's hard drive.
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">How is it secured?</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                When you log in, your PAT is intercepted directly by our authentication system. It is instantly encrypted using an industrial-grade backend secret (`NEXTAUTH_SECRET`).
              </p>
              <p className="text-slate-600 leading-relaxed">
                The encrypted token is then injected into an <strong>HTTP-only, Secure Cookie</strong> and sent back to your browser. This means:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Your browser acts as the secure vault for your token.</li>
                <li>The cookie is invisible to Javascript, rendering Cross-Site Scripting (XSS) attacks completely useless.</li>
                <li>The token is only briefly decrypted in the server's memory when making authorized requests to the GitHub API.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Required Scopes & Data Usage</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                OmniGit requires a classic Personal Access Token with the <strong><code>repo</code></strong> scope. This is the minimum permission required to fetch private repositories from organizations.
              </p>
              <p className="text-slate-600 leading-relaxed">
                <strong>What your token is used for:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Reading issues, pull requests, and repository metadata to populate your Kanban board.</li>
                <li>Updating issue labels (if configured) when you drag and drop tasks across columns.</li>
              </ul>
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-800 text-sm mt-4">
                <strong>Important:</strong> OmniGit does not require or use the <code>admin:repo_hook</code> or <code>delete_repo</code> scopes. It will never modify your source code, delete repositories, or alter organization settings.
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
