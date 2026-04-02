// @TASK P2-R4-T1 - Session Applications API 함수
// @SPEC docs/planning/04-database-design.md#session-applications
// @TEST __tests__/lib/sessionApplications.test.ts

import { createClient } from "@/lib/supabase/client";
import type {
  SessionApplication,
  SessionApplicationWithApplicant,
  SessionApplicationWithSession,
  ApplicationStatus,
} from "@/types/sessionApplication";

export async function applyToSession(
  sessionId: string,
  applicantId: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("session_applications")
    .insert({ session_id: sessionId, applicant_id: applicantId })
    .select()
    .single();
  return { data: data as SessionApplication | null, error };
}

export async function getApplicationsBySession(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("session_applications")
    .select("*, applicant:users(id, name, avatar_url)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  return { data: data as SessionApplicationWithApplicant[] | null, error };
}

export async function getApplicationsByUser(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("session_applications")
    .select("*, session:mentoring_sessions(id, title, status)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
  return { data: data as SessionApplicationWithSession[] | null, error };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("session_applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();
  return { data: data as SessionApplication | null, error };
}
