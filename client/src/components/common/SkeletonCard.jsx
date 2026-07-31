export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900">
      <div className="skeleton h-48 w-full" />
      <div className="skeleton mt-4 h-4 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/2" />
      <div className="skeleton mt-4 h-8 w-full" />
    </div>
  );
}
