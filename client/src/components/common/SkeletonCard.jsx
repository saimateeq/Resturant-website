export default function SkeletonCard() {
  return (
    <div className="overflow-hidden border border-ink/10 bg-cream p-4">
      <div className="skeleton h-48 w-full" />
      <div className="skeleton mt-4 h-4 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/2" />
      <div className="skeleton mt-4 h-8 w-full" />
    </div>
  );
}
