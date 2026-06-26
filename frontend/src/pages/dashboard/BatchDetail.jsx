import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { batchesService } from '../../services/batches'
import { DashboardLayout } from '../../components/shared/DashboardLayout'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const STAGE_COLORS = {
  HARVESTED: '#1A5C2A', AGGREGATED: '#2A8A41', PACKED: '#185FA5',
  IN_TRANSIT: '#E07C24', AT_PORT: '#C0671A', EXPORTED: '#6B35A3',
  DELIVERED: '#374151', REGISTERED: '#1A5C2A', AT_FARM: '#2A8A41',
  AT_ABATTOIR: '#185FA5', PROCESSED: '#E07C24',
}

const TX_LABELS = {
  BATCH_CREATED:    'Batch created',
  STAGE_ADVANCED:   'Stage advanced',
  CUSTODY_TRANSFERRED: 'Custody transferred',
  DOCUMENT_UPLOADED: 'Document uploaded',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function BatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await batchesService.getById(id)
        setBatch(res.data.batch)
        setTransactions(res.data.transactions)
      } catch (err) {
        setError('Failed to load batch.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleAdvance() {
    setAdvancing(true)
    setError('')
    try {
      const res = await batchesService.advance(id, {})
      setBatch(res.data.batch)
      // Reload full transaction list
      const full = await batchesService.getById(id)
      setTransactions(full.data.transactions)
    } catch (err) {
      setError(err.message || 'Failed to advance stage.')
    } finally {
      setAdvancing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Batch Detail">
        <div className="py-16 text-center text-sm text-gray-400">Loading batch...</div>
      </DashboardLayout>
    )
  }

  if (!batch) {
    return (
      <DashboardLayout title="Batch Detail">
        <div className="py-16 text-center text-sm text-red-500">{error || 'Batch not found.'}</div>
      </DashboardLayout>
    )
  }

  const stageColor = STAGE_COLORS[batch.current_stage] || '#374151'

  return (
    <DashboardLayout title="Batch Detail">
      <div className="max-w-3xl space-y-6">

        {/* Batch header card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: stageColor }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-lg font-display font-bold text-ink">{batch.commodity}</h2>
                  {batch.variety && <span className="text-sm text-gray-400">· {batch.variety}</span>}
                  <Badge variant="default">{batch.batch_type}</Badge>
                </div>
                <p className="font-mono text-sm text-forest-600 font-semibold">{batch.trace_id}</p>
              </div>
              <div className="text-right">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
                  style={{ background: stageColor }}
                >
                  {batch.current_stage}
                </div>
              </div>
            </div>

            {/* Batch details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
              {[
                { label: 'Quantity', value: `${batch.quantity} ${batch.unit}` },
                { label: 'Production date', value: new Date(batch.production_date).toLocaleDateString('en-NG') },
                { label: 'Origin', value: [batch.origin_state, batch.origin_lga].filter(Boolean).join(', ') || '—' },
                { label: 'Corridor', value: batch.trade_corridor || 'Not set' },
                { label: 'Compliance', value: batch.compliance_status },
                { label: 'Quality verdict', value: batch.quality_verdict },
                { label: 'Transactions', value: transactions.length },
                { label: 'Created', value: new Date(batch.created_at).toLocaleDateString('en-NG') },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-ink capitalize">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Genesis hash */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Genesis hash (SHA-256)</p>
              <p className="font-mono text-xs text-gray-500 break-all">{batch.genesis_hash}</p>
            </div>

            {/* Advance stage button */}
            <div className="mt-5 flex gap-3">
              <Button
                variant="primary"
                size="md"
                loading={advancing}
                onClick={handleAdvance}
              >
                Advance stage →
              </Button>
              <Button variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </Button>
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}
          </div>
        </div>

        {/* Transaction chain */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-ink">
              Transaction chain
              <span className="ml-2 text-xs font-normal text-gray-400">{transactions.length} records</span>
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, i) => (
              <div key={tx.id} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  {/* Chain connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: i === 0 ? '#1A5C2A' : '#185FA5' }}
                    >
                      {i + 1}
                    </div>
                    {i < transactions.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1 min-h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink">
                        {TX_LABELS[tx.tx_type] || tx.tx_type}
                      </p>
                      {tx.to_stage && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ background: STAGE_COLORS[tx.to_stage] || '#374151' }}
                        >
                          {tx.to_stage}
                        </span>
                      )}
                    </div>
                    {tx.from_stage && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {tx.from_stage} → {tx.to_stage}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(tx.tx_timestamp)}</p>
                    <div className="mt-2 space-y-0.5">
                      <p className="font-mono text-xs text-gray-400 break-all">
                        <span className="text-gray-500 font-sans not-italic">hash: </span>{tx.tx_hash}
                      </p>
                      {tx.previous_hash && (
                        <p className="font-mono text-xs text-gray-300 break-all">
                          <span className="text-gray-400 font-sans not-italic">prev: </span>{tx.previous_hash}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
