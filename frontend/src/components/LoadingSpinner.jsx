export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner rings */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-brand-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-500" />
          <div
            className="absolute inset-1.5 animate-spin rounded-full border-[3px] border-transparent border-t-brand-300"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
        <p className="text-sm font-medium text-slate-400 tracking-wide">Loading…</p>
      </div>
    </div>
  );
}
