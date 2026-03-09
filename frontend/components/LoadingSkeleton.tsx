export function LoadingSkeleton({ className = "h-24" }: { className?: string }) {
  return (
    <div
      className={`glass grid-sheen relative overflow-hidden rounded-2xl ${className}`}
      aria-label="Loading"
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
    </div>
  );
}