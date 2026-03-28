export default function Card({ children, className = '', hover = false, padding = 'md', glass = false }) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={`
        ${glass ? 'glass' : 'bg-white border border-slate-100 shadow-premium'}
        rounded-3xl
        ${hover ? 'hover:shadow-premium-hover hover:border-slate-200 transition-all duration-300 hover:scale-[1.01]' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
