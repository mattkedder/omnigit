'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateTaskDrawer from './CreateTaskDrawer';

export default function CreateTaskButton({ repos }: { repos: { fullName: string }[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-6 right-6 z-50 md:static md:bottom-auto md:right-auto md:z-auto h-14 w-14 md:h-8 md:w-auto md:px-3 text-white bg-purple-600 rounded-full md:rounded-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/30 md:focus:ring-2 md:focus:ring-purple-500/50 transition-all flex items-center justify-center gap-1.5 shadow-xl shadow-purple-500/20 md:shadow-sm"
      >
        <Plus className="w-6 h-6 md:w-3.5 md:h-3.5" />
        <span className="hidden md:inline text-xs font-medium">Task</span>
      </button>

      <CreateTaskDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        repos={repos}
      />
    </>
  );
}
