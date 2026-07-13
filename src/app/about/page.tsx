import Link from 'next/link';
import { ArrowLeft, Info, Users } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="none"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-purple-100 p-6 md:p-12 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" /> About OmniGit
            </h1>
          </div>
          <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
            <img src="/icons/icon-96x96.png" alt="Logo" className="w-6 h-6 object-cover rounded-sm" />
          </div>
        </div>

        <div className="p-8 space-y-10">
          
          {/* App Explanation */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Your New Favorite GitHub Task Manager</h2>
            <p className="text-slate-600 leading-relaxed">
              OmniGit is a super fast, local-first desktop app built to make managing GitHub issues and pull requests a breeze. 
              If you're a product manager, project manager, or supervisor juggling multiple repositories, you know how slow and clunky navigating through standard web interfaces can get.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              We sync all your GitHub data straight into a snappy local database on your machine. This means you can filter, sort, and organize tasks instantly without staring at loading spinners. Whether you love a good old-fashioned list view, a Kanban board, or just need to check high-level insights, OmniGit's got you covered so you can get back to actually shipping great software.
            </p>
          </section>

          {/* Contributors Section */}
          <section className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Open for Contributors</h3>
            </div>
            <p className="text-purple-900/80 leading-relaxed mb-6">
              OmniGit is an open-source project, and we welcome contributions from developers all around the world! 
              Whether you want to fix a bug, add a new feature, or improve the UI, we would love to have you on board.
            </p>
            <a 
              href="https://github.com/mattkedder/omnigit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              <GithubIcon className="w-4 h-4" />
              View on GitHub
            </a>
          </section>

          {/* Author Section */}
          <section className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Meet the Author</h3>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                <img src="/author.jpg" alt="Author" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">Matt Kedder</h4>
                <p className="text-slate-500 text-sm mt-0.5">Creator of OmniGit</p>
                <a 
                  href="https://github.com/mattkedder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                >
                  @mattkedder
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
