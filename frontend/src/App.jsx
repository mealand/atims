import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/shared/ProtectedRoute'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PendingVerification from './pages/auth/PendingVerification'

// Farmer / public entity pages
import FarmerDashboard from './pages/dashboard/FarmerDashboard'
import CreateBatch from './pages/dashboard/CreateBatch'
import BatchDetail from './pages/dashboard/BatchDetail'

// Inspector pages
import InspectorDashboard from './pages/inspector/InspectorDashboard'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

const PUBLIC_ENTITY_ROLES = [
  'farmer','rancher','aggregator','packing_house',
  'abattoir','food_safety_lab','cold_chain','export_agent',
]

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending" element={<PendingVerification />} />

      {/* Farmer / public entity routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={PUBLIC_ENTITY_ROLES}><FarmerDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/batches/new" element={
        <ProtectedRoute allowedRoles={PUBLIC_ENTITY_ROLES}><CreateBatch /></ProtectedRoute>
      } />
      <Route path="/dashboard/batches/:id" element={
        <ProtectedRoute allowedRoles={PUBLIC_ENTITY_ROLES}><BatchDetail /></ProtectedRoute>
      } />

      {/* Inspector routes */}
      <Route path="/inspector/*" element={
        <ProtectedRoute allowedRoles={['inspector']}><InspectorDashboard /></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
