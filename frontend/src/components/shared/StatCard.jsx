export function StatCard({ label, value, sub, accentColor = '#1A5C2A' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-ink" style={{ color: accentColor }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
