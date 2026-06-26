import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerEntity } from '../../lib/auth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const PUBLIC_ROLES = [
  { value: 'farmer',         label: 'Farmer / Grower' },
  { value: 'rancher',        label: 'Rancher / Livestock Producer' },
  { value: 'aggregator',     label: 'Aggregator / Cooperative' },
  { value: 'packing_house',  label: 'Packing House' },
  { value: 'abattoir',       label: 'Abattoir / Processor' },
  { value: 'food_safety_lab',label: 'Food Safety Laboratory' },
  { value: 'cold_chain',     label: 'Cold Chain Logistics' },
  { value: 'export_agent',   label: 'Export Agent / Freight Forwarder' },
]

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', password: '', role: '',
    business_name: '', contact_name: '',
    phone: '', state_province: '', lga: '', reg_number: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function nextStep() {
    if (!form.role || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setStep(2)
  }

  async function handleSubmit() {
    setError('')
    if (!form.business_name || !form.contact_name) {
      setError('Business name and contact name are required.')
      return
    }
    setLoading(true)
    try {
      await registerEntity(form)
      navigate('/pending')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-forest-600 font-display font-bold text-xl">ATiMs</span>
          <h2 className="text-2xl font-display font-bold text-ink mt-2">Register your organisation</h2>
          <p className="text-gray-500 text-sm mt-1">Your account will be verified by an ATiMs inspector before you can transact.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${step >= s ? 'bg-forest-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-forest-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Account details' : 'Organisation details'}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-forest-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation type <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="">Select your role in the supply chain</option>
                  {PUBLIC_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <Input id="email" name="email" type="email" label="Email address *" placeholder="you@yourorg.com" value={form.email} onChange={handleChange} />
              <Input id="password" name="password" type="password" label="Password *" placeholder="Minimum 8 characters" value={form.password} onChange={handleChange} hint="At least 8 characters" />
              {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
              <Button variant="primary" size="lg" onClick={nextStep} className="w-full">Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input id="business_name" name="business_name" label="Business / Organisation name *" placeholder="e.g. Kaduna Farms Ltd" value={form.business_name} onChange={handleChange} />
              <Input id="contact_name" name="contact_name" label="Primary contact name *" placeholder="Full name" value={form.contact_name} onChange={handleChange} />
              <Input id="phone" name="phone" type="tel" label="Phone number" placeholder="+234..." value={form.phone} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select name="state_province" value={form.state_province} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500">
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input id="lga" name="lga" label="Local Government Area (LGA)" placeholder="e.g. Chikun" value={form.lga} onChange={handleChange} />
              <Input id="reg_number" name="reg_number" label="CAC / Registration number" placeholder="Optional" value={form.reg_number} onChange={handleChange} hint="CAC number, NAQS license, or relevant registration" />
              {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button variant="primary" size="lg" loading={loading} onClick={handleSubmit} className="flex-1">Submit registration</Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-forest-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
