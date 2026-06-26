import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../lib/auth'

const NAV_ITEMS = {
  farmer: [
    { to: '/dashboard', label: 'Overview', icon: '◈' },
    { to: '/dashboard/batches', label: 'My Batches', icon: '⊞' },
    { to: '/dashboard/documents', label: 'Documents', icon: '⊟' },
  ],
  rancher: [
    { to: '/dashboard', label: 'Overview', icon: '◈' },
    { to: '/dashboard/batches', label: 'My Batches', icon: '⊞' },
    { to: '/dashboard/documents', label: 'Documents', icon: '⊟' },
  ],
  inspector: [
    { to: '/inspector', label: 'Overview', icon: '◈' },
    { to: '/inspector/pending', label: 'Pending Entities', icon: '⊡' },
    { to: '/inspector/documents', label: 'Document Queue', icon: '⊟' },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: '◈' },
    { to: '/admin/entities', label: 'All Entities', icon: '⊞' },
    { to: '/admin/batches', label: 'All Batches', icon: '⊡' },
    { to: '/admin/system', label: 'System', icon: '⊛' },
  ],
}

const ROLE_LABELS = {
  farmer: 'Farmer',
  rancher: 'Rancher',
  aggregator: 'Aggregator',
  packing_house: 'Packing House',
  abattoir: 'Abattoir',
  food_safety_lab: 'Food Safety Lab',
  cold_chain: 'Cold Chain',
  export_agent: 'Export Agent',
  inspector: 'Inspector',
  admin: 'Administrator',
}

export function Sidebar() {
  const { entity } = useAuth()
  const navigate = useNavigate()
  const navItems = NAV_ITEMS[entity?.role] || NAV_ITEMS.farmer

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-forest-600 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-forest-700">
        <div className="flex items-baseline gap-2">
          <span className="text-white font-display font-bold text-lg tracking-tight">ATiMs</span>
          <span className="text-forest-300 text-xs">v1.0</span>
        </div>
        <p className="text-forest-400 text-xs mt-0.5 leading-tight">Agro-Trace Integrated<br />Management System</p>
      </div>

      {/* Entity info */}
      <div className="px-5 py-4 border-b border-forest-700">
        <p className="text-forest-300 text-xs uppercase tracking-widest mb-1">Logged in as</p>
        <p className="text-white text-sm font-medium truncate">{entity?.business_name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="bg-forest-700 text-forest-200 text-xs px-2 py-0.5 rounded-full font-mono">
            {entity?.nexus_id}
          </span>
        </div>
        <p className="text-amber-400 text-xs mt-1 font-medium">{ROLE_LABELS[entity?.role]}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive
                ? 'bg-white text-forest-700 font-semibold'
                : 'text-forest-200 hover:bg-forest-700 hover:text-white'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-forest-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest-300 hover:bg-forest-700 hover:text-white transition-colors"
        >
          <span className="text-base leading-none">⊖</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
