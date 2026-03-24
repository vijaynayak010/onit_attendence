export default function Card({ children, className = '', hover = false, padding = 'md' }) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm
        ${hover ? 'hover:shadow-md hover:border-gray-200 transition-all duration-200' : ''}
        ${paddings[padding]}
        ${className}`}
    >
      {children}
    </div>
  );
}
