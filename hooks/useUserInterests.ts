'use client'

// @TASK P2-R2-T1 - User Interests 커스텀 훅
// @SPEC docs/planning/04-database-design.md#user_interests

import { useCallback, useEffect, useState } from 'react'
import {
  getUserInterests,
  createUserInterest,
  deleteUserInterest,
} from '@/lib/api/userInterests'
import type { UserInterest, CreateUserInterestData } from '@/types/userInterest'

/**
 * 유저의 관심사(배우고 싶은 것) 목록을 관리하는 훅.
 *
 * @param userId - 유저 UUID (undefined이면 fetch를 건너뜁니다)
 * @returns { interests, isLoading, error, addInterest, removeInterest, refetch }
 */
export function useUserInterests(userId?: string) {
  const [interests, setInterests] = useState<UserInterest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInterests = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await getUserInterests(userId)
      if (err) {
        setError(err.message)
        setInterests([])
      } else {
        setInterests(data ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setInterests([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchInterests()
  }, [fetchInterests])

  const addInterest = useCallback(
    async (data: CreateUserInterestData) => {
      if (!userId) return { data: null, error: { message: 'User ID is required' } }
      setError(null)
      try {
        const result = await createUserInterest(userId, data)
        if (result.error) {
          setError(result.error.message)
          return { data: null, error: result.error }
        }
        if (result.data) {
          setInterests((prev) => [result.data!, ...prev])
        }
        return { data: result.data, error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setError(msg)
        return { data: null, error: { message: msg } }
      }
    },
    [userId]
  )

  const removeInterest = useCallback(
    async (interestId: string) => {
      setError(null)
      try {
        const { error: err } = await deleteUserInterest(interestId)
        if (err) {
          setError(err.message)
          return { error: err }
        }
        setInterests((prev) => prev.filter((i) => i.id !== interestId))
        return { error: null }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setError(msg)
        return { error: { message: msg } }
      }
    },
    []
  )

  return { interests, isLoading, error, addInterest, removeInterest, refetch: fetchInterests }
}
