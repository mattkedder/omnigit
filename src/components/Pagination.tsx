'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type PaginationProps = {
  page: number;
  totalPages: number;
  searchParams: Record<string, string>;
};

export default function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p.toString());
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={getPageUrl(page - 1)} className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button disabled className="p-2 border border-slate-100 rounded-md text-slate-300 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p = page - 2 + i;
            if (page <= 2) p = i + 1;
            if (page >= totalPages - 1) p = totalPages - 4 + i;
            if (p < 1 || p > totalPages) return null;
            
            return (
              <Link 
                key={p} 
                href={getPageUrl(p)}
                className={`px-3 py-1 text-sm border rounded-md transition-colors ${p === page ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {page < totalPages ? (
          <Link href={getPageUrl(page + 1)} className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button disabled className="p-2 border border-slate-100 rounded-md text-slate-300 cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
