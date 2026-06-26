export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    verified:  'bg-green-100 text-green-800 border border-green-200',
    pending:   'bg-amber-100 text-amber-800 border border-amber-200',
    rejected:  'bg-red-100 text-red-800 border border-red-200',
    suspended: 'bg-gray-100 text-gray-600 border border-gray-200',
    default:   'bg-blue-100 text-blue-800 border border-blue-200',
    role:      'bg-forest-50 text-forest-700 border border-forest-100',
  }
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
