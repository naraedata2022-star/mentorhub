// @TASK P2-R3-T1 - Mentoring Sessions API 함수
// @SPEC docs/planning/04-database-design.md#mentoring-sessions
// @TEST __tests__/lib/mentoringSessions.test.ts

import { createClient } from "@/lib/supabase/client";
import type {
  MentoringSession,
  MentoringSessionWithMentor,
  CreateSessionData,
  SessionStatus,
} from "@/types/mentoringSession";

export async function getMentoringSessions(filters?: {
  categoryId?: string;
  status?: SessionStatus;
}) {
  const supabase = createClient();
  let query = supabase
    .from("mentoring_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  return { data: data as MentoringSession[] | null, error };
}

export async function getSessionById(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mentoring_sessions")
    .select("*, mentor:users(id, name, avatar_url, region)")
    .eq("id", sessionId)
    .single();
  return { data: data as MentoringSessionWithMentor | null, error };
}

export async function createSession(
  mentorId: string,
  data: CreateSessionData
) {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("mentoring_sessions")
    .insert({ mentor_id: mentorId, ...data })
    .select()
    .single();
  return { data: result as MentoringSession | null, error };
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mentoring_sessions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select()
    .single();
  return { data: data as MentoringSession | null, error };
}

export async function getSessionsByMentor(mentorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mentoring_sessions")
    .select("*")
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false });
  return { data: data as MentoringSession[] | null, error };
}

export async function searchSessions(query: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mentoring_sessions")
    .select("*")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false });
  return { data: data as MentoringSession[] | null, error };
}
