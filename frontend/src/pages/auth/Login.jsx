import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../lib/auth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    setError('')
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      // useAuth hook will pick up the session and redirect via ProtectedRoute
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-2/5 bg-forest-600 flex-col justify-between p-12">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-white font-display font-bold text-2xl tracking-tight">ATiMs</span>
          </div>
          <p className="text-forest-300 text-sm leading-relaxed">
            Agro-Trace Integrated<br />Management System
          </p>
        </div>
        <div className="space-y-6">
          {[
            { label: 'Traceability', desc: 'Every batch tracked from farm to export' },
            { label: 'Compliance', desc: 'Stage-gate enforcement across corridors' },
            { label: 'Quality', desc: 'Standards evaluation against Codex and MRL' },
            { label: 'Trade Facilitation', desc: 'NTM advisory for export readiness' },
          ].map(item => (
            <div key={item.label} className="flex gap-3">
              <div className="w-1 rounded-full bg-amber-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">{item.label}</p>
                <p className="text-forest-300 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-forest-500 text-xs">
          Strengthening Nigerian agricultural trade infrastructure
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-ink">Sign in</h2>
            <p className="text-gray-500 text-sm mt-1">
              Access your ATiMs dashboard
            </p>
          </div>

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleSubmit}
              className="w-full"
            >
              Sign in
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to ATiMs?{' '}
            <Link to="/register" className="text-forest-600 font-medium hover:underline">
              Register your organisation
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
