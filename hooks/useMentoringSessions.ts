// @TASK P2-R3-T1 - Mentoring Sessions React 훅
// @SPEC docs/planning/04-database-design.md#mentoring-sessions

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMentoringSessions,
  getSessionById,
} from "@/lib/api/mentoringSessions";
import type {
  MentoringSession,
  MentoringSessionWithMentor,
  SessionStatus,
} from "@/types/mentoringSession";

/**
 * 멘토링 세션 목록을 조회하는 훅.
 * 필터가 변경되면 자동으로 재조회합니다.
 *
 * @param filters - 선택적 필터 (categoryId, status)
 * @returns { sessions, isLoading, error, refetch }
 */
export function useMentoringSessions(filters?: {
  categoryId?: string;
  status?: SessionStatus;
}) {
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getMentoringSessions(filters);
      if (err) {
        setError(err.message);
        setSessions([]);
      } else {
        setSessions(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.categoryId, filters?.status]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, error, refetch: fetchSessions };
}

/**
 * 단일 멘토링 세션 상세 정보를 조회하는 훅.
 * mentor 정보가 조인되어 반환됩니다.
 *
 * @param sessionId - 세션 UUID
 * @returns { session, isLoading, error, refetch }
 */
export function useSessionDetail(sessionId: string) {
  const [session, setSession] = useState<MentoringSessionWithMentor | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getSessionById(sessionId);
      if (err) {
        setError(err.message);
        setSession(null);
      } else {
        setSession(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, isLoading, error, refetch: fetchSession };
}
