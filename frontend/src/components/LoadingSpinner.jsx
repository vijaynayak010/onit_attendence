export default function LoadingSpinner() {
  return (
    <div className="fixed inset-x-0 top-0 z-[9999]">
      {/* Slim animated progress bar at the very top */}
      <div className="h-[3px] w-full bg-brand-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400 rounded-full"
          style={{
            width: '40%',
            animation: 'loadingBar 1.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
