// @TASK P3-R1-T1 - Matches React 훅
// @SPEC docs/planning/04-database-design.md#matches

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMatchesForUser,
  updateMatchStatus,
} from "@/lib/api/matches";
import type { MatchWithUser } from "@/types/match";

/**
 * 사용자의 매치 목록을 조회하고 상태를 관리하는 훅.
 * 수락/거절 액션을 제공합니다.
 *
 * @param userId - 사용자 UUID (없으면 조회하지 않음)
 * @returns { matches, isLoading, error, acceptMatch, dismissMatch, refetch }
 */
export function useMatches(userId?: string) {
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!userId) {
      setMatches([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getMatchesForUser(userId);
      if (err) {
        setError(err.message);
        setMatches([]);
      } else {
        setMatches(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const acceptMatch = useCallback(
    async (matchId: string) => {
      try {
        const { error: err } = await updateMatchStatus(matchId, "accepted");
        if (err) {
          setError(err.message);
          return;
        }
        // 로컬 상태 즉시 업데이트 (optimistic)
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, status: "accepted" as const } : m
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    []
  );

  const dismissMatch = useCallback(
    async (matchId: string) => {
      try {
        const { error: err } = await updateMatchStatus(matchId, "dismissed");
        if (err) {
          setError(err.message);
          return;
        }
        // 로컬 상태 즉시 업데이트 (optimistic)
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, status: "dismissed" as const } : m
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    []
  );

  return {
    matches,
    isLoading,
    error,
    acceptMatch,
    dismissMatch,
    refetch: fetchMatches,
  };
}
