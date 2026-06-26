import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function PendingVerification() {
  const { entity } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⏳</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-ink mb-2">Verification pending</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your registration has been received. An ATiMs inspector will review and verify your account before you can access the platform.
        </p>
        {entity?.nexus_id && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Your registration details</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nexus ID</span>
                <span className="font-mono font-semibold text-forest-600">{entity.nexus_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Organisation</span>
                <span className="font-medium text-ink">{entity.business_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Role</span>
                <span className="text-ink capitalize">{entity.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="text-amber-600 font-semibold">Pending</span>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">
          You will be able to sign in and access your dashboard once verified.{' '}
          <Link to="/login" className="text-forest-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
