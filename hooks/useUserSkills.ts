'use client'

// @TASK P2-R1-T1 - User Skills 커스텀 훅
// @SPEC docs/planning/04-database-design.md#user_skills
// @TEST __tests__/hooks/useUserSkills.test.ts

import { useCallback, useEffect, useState } from 'react'
import {
  getUserSkills,
  createUserSkill,
  deleteUserSkill,
} from '@/lib/api/userSkills'
import type { UserSkill, CreateUserSkillData } from '@/types/userSkill'

/**
 * 사용자의 스킬(가르칠 수 있는 것) 목록을 관리하는 훅.
 *
 * @param userId - 대상 사용자 UUID (undefined이면 fetch하지 않음)
 * @returns { skills, isLoading, error, addSkill, removeSkill, refetch }
 */
export function useUserSkills(userId?: string) {
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSkills = useCallback(async () => {
    if (!userId) {
      setSkills([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await getUserSkills(userId)
      if (err) {
        setError(err.message)
        setSkills([])
      } else {
        setSkills(data ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const addSkill = useCallback(
    async (data: CreateUserSkillData) => {
      if (!userId) return { data: null, error: 'User ID is required' }

      const { data: newSkill, error: err } = await createUserSkill(userId, data)
      if (err) {
        return { data: null, error: err.message }
      }
      if (newSkill) {
        setSkills((prev) => [newSkill, ...prev])
      }
      return { data: newSkill, error: null }
    },
    [userId]
  )

  const removeSkill = useCallback(async (skillId: string) => {
    const { error: err } = await deleteUserSkill(skillId)
    if (err) {
      return { error: err.message }
    }
    setSkills((prev) => prev.filter((s) => s.id !== skillId))
    return { error: null }
  }, [])

  return { skills, isLoading, error, addSkill, removeSkill, refetch: fetchSkills }
}
