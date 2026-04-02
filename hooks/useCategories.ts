'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '@/lib/api/categories'
import type { Category } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await getCategories()
      if (err) {
        setError(err.message)
        setCategories([])
      } else {
        setCategories(data ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, isLoading, error, refetch: fetchCategories }
}
