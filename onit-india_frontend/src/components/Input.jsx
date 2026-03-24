export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  icon: Icon,
  className = '',
  hint,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
            transition-all duration-200 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
