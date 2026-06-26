export function Card({ children, className = '', statusColor }) {
  return (
    <div className={`relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {statusColor && (
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: statusColor }} />
      )}
      <div className={statusColor ? 'pl-4' : ''}>
        {children}
      </div>
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
