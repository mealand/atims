import { DashboardLayout } from '../../components/shared/DashboardLayout'
import { StatCard } from '../../components/shared/StatCard'
import { EmptyState } from '../../components/shared/EmptyState'

export default function AdminDashboard() {
  return (
    <DashboardLayout title="System Administration">
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-ink">System Overview</h2>
        <p className="text-gray-500 text-sm mt-0.5">Platform health, entity metrics, and batch activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Entities" value="—" sub="All registered orgs" accentColor="#1A5C2A" />
        <StatCard label="Active Batches" value="—" sub="In supply chain" accentColor="#185FA5" />
        <StatCard label="Transactions" value="—" sub="Blockchain records" accentColor="#E07C24" />
        <StatCard label="Pending Verifications" value="—" sub="Awaiting review" accentColor="#6B35A3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-ink">Recent Registrations</h3>
          </div>
          <EmptyState title="No data yet" description="Entity registration activity will appear here once the metrics system is wired." />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-ink">Batch Activity</h3>
          </div>
          <EmptyState title="No data yet" description="Supply chain activity across all batches will appear here." />
        </div>
      </div>
    </DashboardLayout>
  )
}
