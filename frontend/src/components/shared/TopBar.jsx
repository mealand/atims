import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../ui/Badge'

export function TopBar({ title }) {
  const { entity } = useAuth()

  const statusVariant = {
    verified: 'verified',
    pending: 'pending',
    rejected: 'rejected',
    suspended: 'suspended',
  }[entity?.status] || 'default'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <Badge variant={statusVariant}>
          {entity?.status?.charAt(0).toUpperCase() + entity?.status?.slice(1)}
        </Badge>
        <span className="text-xs text-gray-400 font-mono hidden sm:block">{entity?.nexus_id}</span>
      </div>
    </header>
  )
}
