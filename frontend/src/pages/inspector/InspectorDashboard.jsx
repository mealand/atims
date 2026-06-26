import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/shared/DashboardLayout'
import { StatCard } from '../../components/shared/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/shared/EmptyState'
import { api } from '../../services/api'

const ROLE_LABELS = {
  farmer: 'Farmer', rancher: 'Rancher', aggregator: 'Aggregator',
  packing_house: 'Packing House', abattoir: 'Abattoir',
  food_safety_lab: 'Food Safety Lab', cold_chain: 'Cold Chain',
  export_agent: 'Export Agent',
}

export default function InspectorDashboard() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')

  async function fetchPending() {
    try {
      const res = await api.get('/entities/pending')
      setPending(res.data.entities)
    } catch (err) {
      setError('Failed to load pending entities.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPending() }, [])

  async function handleVerify(id) {
    setActionLoading(id + '_verify')
    try {
      await api.patch(`/entities/${id}/verify`)
      await fetchPending()
    } catch (err) {
      setError('Verification failed.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return
    setActionLoading(id + '_reject')
    try {
      await api.patch(`/entities/${id}/reject`, { reason })
      await fetchPending()
    } catch (err) {
      setError('Rejection failed.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardLayout title="Inspector Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-ink">Verification Queue</h2>
        <p className="text-gray-500 text-sm mt-0.5">Review and verify pending entity registrations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Verification" value={pending.length} sub="Awaiting review" accentColor="#E07C24" />
        <StatCard label="Verified Today" value="—" sub="Coming soon" accentColor="#1A5C2A" />
        <StatCard label="Total Entities" value="—" sub="All roles" accentColor="#185FA5" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-ink">
            Pending Entities
            {pending.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
        ) : pending.length === 0 ? (
          <EmptyState title="No pending entities" description="All registrations have been reviewed. New submissions will appear here." />
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map(entity => (
              <div key={entity.id} className="px-5 py-4 flex items-start justify-between gap-4">
                {/* Status rail */}
                <div className="w-1 h-full rounded-full bg-amber-400 shrink-0 self-stretch" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink">{entity.business_name}</p>
                    <Badge variant="pending">Pending</Badge>
                    <Badge variant="default">{ROLE_LABELS[entity.role] || entity.role}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{entity.contact_name} · {entity.email}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-mono text-xs text-forest-600">{entity.nexus_id}</span>
                    {entity.state_province && <span className="text-xs text-gray-400">{entity.state_province}</span>}
                    {entity.reg_number && <span className="text-xs text-gray-400">Reg: {entity.reg_number}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={actionLoading === entity.id + '_reject'}
                    onClick={() => handleReject(entity.id)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading === entity.id + '_verify'}
                    onClick={() => handleVerify(entity.id)}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
