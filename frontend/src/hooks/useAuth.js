import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentEntity } from '../lib/auth'

/**
 * Central auth state hook. Tracks the Supabase session AND the
 * matching entity record (role, status, nexus_id).
 *
 * Usage:
 *   const { user, entity, loading, isVerified } = useAuth()
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [entity, setEntity] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadEntity = useCallback(async () => {
    try {
      const entityData = await getCurrentEntity()
      setEntity(entityData)
    } catch (err) {
      // No entity record yet, or token invalid — leave entity null
      setEntity(null)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadEntity()
      else setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadEntity().finally(() => setLoading(false))
      } else {
        setEntity(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadEntity])

  useEffect(() => {
    if (user) setLoading(false)
  }, [entity, user])

  return {
    user,
    entity,
    loading,
    isAuthenticated: !!user,
    isVerified: entity?.status === 'verified',
    role: entity?.role ?? null,
  }
}
