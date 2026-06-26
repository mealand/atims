import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { batchesService } from '../../services/batches'
import { DashboardLayout } from '../../components/shared/DashboardLayout'
import { StatCard } from '../../components/shared/StatCard'
import { EmptyState } from '../../components/shared/EmptyState'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

const STAGE_COLORS = {
  HARVESTED: '#1A5C2A', AGGREGATED: '#2A8A41', PACKED: '#185FA5',
  IN_TRANSIT: '#E07C24', AT_PORT: '#C0671A', EXPORTED: '#6B35A3',
  DELIVERED: '#374151', REGISTERED: '#1A5C2A', AT_FARM: '#2A8A41',
  AT_ABATTOIR: '#185FA5', PROCESSED: '#E07C24',
}

export default function FarmerDashboard() {
  const { entity } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    batchesService.getAll()
      .then(res => setBatches(res.data.batches))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeBatches = batches.filter(b => b.current_stage !== 'DELIVERED')

  return (
    <DashboardLayout title="Farm Overview">
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-ink">
          Welcome, {entity?.contact_name?.split(' ')[0]}
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {entity?.business_name} · {entity?.nexus_id}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Batches" value={batches.length} sub="All time" accentColor="#1A5C2A" />
        <StatCard label="Active Batches" value={activeBatches.length} sub="In supply chain" accentColor="#185FA5" />
        <StatCard label="Documents" value="0" sub="Uploaded files" accentColor="#E07C24" />
        <StatCard label="Compliance" value="—" sub="Phase 2" accentColor="#6B7280" />
      </div>

      {/* Batch list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">My Batches</h3>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/batches/new')}>
            + New Batch
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading batches...</div>
        ) : batches.length === 0 ? (
          <EmptyState
            title="No batches yet"
            description="Create your first batch to begin tracing your harvest from farm to export."
            action={
              <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/batches/new')}>
                Create first batch
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {batches.map(batch => (
              <div
                key={batch.id}
                onClick={() => navigate(`/dashboard/batches/${batch.id}`)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Status rail */}
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ background: STAGE_COLORS[batch.current_stage] || '#374151', minHeight: 40 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink">{batch.commodity}</p>
                    {batch.variety && <span className="text-xs text-gray-400">{batch.variety}</span>}
                    <Badge variant="default">{batch.batch_type}</Badge>
                  </div>
                  <p className="font-mono text-xs text-forest-600 mt-0.5">{batch.trace_id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {batch.quantity} {batch.unit}
                    {batch.origin_state && ` · ${batch.origin_state}`}
                    {batch.trade_corridor && ` · ${batch.trade_corridor}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                    style={{ background: STAGE_COLORS[batch.current_stage] || '#374151' }}
                  >
                    {batch.current_stage}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(batch.created_at).toLocaleDateString('en-NG')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
