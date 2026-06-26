import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-56">
        <TopBar title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
