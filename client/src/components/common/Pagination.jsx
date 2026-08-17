import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import cn from '@utils/cn';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:text-ink disabled:opacity-30"
        aria-label="Previous page"
      >
        <FiChevronLeft />
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-ink/30">…</span>}
          <button
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full font-body text-sm font-medium transition-colors',
              p === page ? 'bg-ink text-cream' : 'text-ink/60 hover:bg-ink/5',
            )}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:text-ink disabled:opacity-30"
        aria-label="Next page"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
