'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProfile, updateProfile, type UpdateProfileData } from '@/lib/api/users'

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await getProfile(userId)
      if (err) { setError(err.message); setProfile(null) }
      else { setProfile(data) }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { profile, isLoading, error, refetch: fetchProfile }
}

export function useUpdateProfile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (userId: string, data: UpdateProfileData) => {
    setIsUpdating(true)
    setError(null)
    try {
      const result = await updateProfile(userId, data)
      if (result.error) {
        setError(result.error.message)
        return { data: null, error: result.error }
      }
      return { data: result.data, error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      return { data: null, error: { message: msg } }
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return { updateProfile: update, isUpdating, error }
}
