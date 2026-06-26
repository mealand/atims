import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { batchesService } from '../../services/batches'
import { DashboardLayout } from '../../components/shared/DashboardLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const COMMODITIES = {
  crop: [
    'Sesame Seeds','Cashew Nuts','Cocoa Beans','Cassava','Maize / Corn',
    'Soybeans','Rice','Sorghum','Ofada Rice','Ginger','Pepper',
    'Tomatoes','Yams','Cowpea','Groundnuts','Other',
  ],
  livestock: [
    'Cattle','Goats','Sheep','Poultry (Chicken)','Fish (Farmed)',
    'Catfish','Eggs','Other',
  ],
}

const UNITS = {
  crop:      ['kg', 'MT', 'tonnes', 'bags', 'litres'],
  livestock: ['head', 'kg', 'MT', 'crates', 'litres'],
}

const CORRIDORS = [
  { value: '', label: 'Not yet determined' },
  { value: 'LOCAL',        label: 'Domestic / Nigeria' },
  { value: 'EU',           label: 'European Union' },
  { value: 'UK',           label: 'United Kingdom' },
  { value: 'UAE',          label: 'UAE / Gulf States' },
  { value: 'AFCFTA_WEST',  label: 'AfCFTA — West Africa' },
  { value: 'AFCFTA_EAST',  label: 'AfCFTA — East Africa' },
  { value: 'USA',          label: 'United States' },
  { value: 'ASIA_EAST',    label: 'East Asia' },
]

export default function CreateBatch() {
  const { entity } = useAuth()
  const navigate = useNavigate()

  const batchType = entity?.role === 'rancher' ? 'livestock' : 'crop'

  const [form, setForm] = useState({
    commodity: '', variety: '', quantity: '', unit: '',
    production_date: '', origin_state: entity?.state_province || '',
    origin_lga: entity?.lga || '', trade_corridor: '', notes: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    setError('')
    if (!form.commodity || !form.quantity || !form.unit || !form.production_date) {
      setError('Commodity, quantity, unit, and production date are required.')
      return
    }
    setLoading(true)
    try {
      const res = await batchesService.create({ ...form, batch_type: batchType })
      navigate(`/dashboard/batches/${res.data.batch.id}`)
    } catch (err) {
      setError(err.message || 'Failed to create batch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="New Batch">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-display font-bold text-ink">Create a new batch</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            A Trace ID and blockchain fingerprint will be generated automatically.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Batch type — read only, derived from role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch type</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-forest-600 capitalize">{batchType}</span>
              <span className="text-xs text-gray-400">— derived from your role</span>
            </div>
          </div>

          {/* Commodity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commodity <span className="text-red-500">*</span>
            </label>
            <select
              name="commodity"
              value={form.commodity}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">Select commodity</option>
              {COMMODITIES[batchType].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Input
            id="variety" name="variety" label="Variety / Breed"
            placeholder="e.g. Ofada, Angus — optional"
            value={form.variety} onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="quantity" name="quantity" type="number" label="Quantity *"
              placeholder="e.g. 500"
              value={form.quantity} onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select
                name="unit" value={form.unit} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Select unit</option>
                {UNITS[batchType].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <Input
            id="production_date" name="production_date" type="date"
            label="Production / Harvest date *"
            value={form.production_date} onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="origin_state" name="origin_state" label="Origin state"
              placeholder="e.g. Kaduna"
              value={form.origin_state} onChange={handleChange}
            />
            <Input
              id="origin_lga" name="origin_lga" label="Origin LGA"
              placeholder="e.g. Chikun"
              value={form.origin_lga} onChange={handleChange}
            />
          </div>

          {/* Trade corridor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination corridor</label>
            <select
              name="trade_corridor" value={form.trade_corridor} onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {CORRIDORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <Input
            id="notes" name="notes" label="Notes"
            placeholder="Optional notes about this batch"
            value={form.notes} onChange={handleChange}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" size="lg" loading={loading} onClick={handleSubmit} className="flex-1">
              Create batch
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
