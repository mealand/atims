import { supabase } from './supabase'
import { api } from '../services/api'

/**
 * Registers a new entity. Calls the API (not Supabase directly) because
 * entity creation involves Nexus ID generation and a DB insert that
 * must use the service role key — logic that lives server-side only.
 */
export async function registerEntity(formData) {
  // formData: { email, password, role, business_name, contact_name, phone, state_province, lga, address, reg_number }
  return api.post('/auth/register', formData)
}

/**
 * Logs in using Supabase Auth directly (client-side).
 * No API round-trip needed — Supabase issues the JWT itself.
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Logs out the current session.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/**
 * Fetches the current authenticated entity's full record from the API.
 * Includes role, status, nexus_id — everything the UI needs to route
 * the user to the correct dashboard.
 */
export async function getCurrentEntity() {
  const { data } = await api.get('/auth/me')
  return data.entity
}
