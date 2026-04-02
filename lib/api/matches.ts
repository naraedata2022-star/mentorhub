// @TASK P3-R1-T1 - Matches API 함수
// @SPEC docs/planning/04-database-design.md#matches
// @TEST __tests__/lib/matches.test.ts

import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus, MatchWithUser } from "@/types/match";

/**
 * 특정 사용자의 매치 목록을 조회합니다.
 * user_a_id 또는 user_b_id가 userId인 매치를 모두 반환하며,
 * 상대방(partner) 정보를 조인합니다.
 *
 * 전략: 양방향 매치를 각각 조회 후 합치고, partner를 수동 조합.
 * Supabase에서 or + 동적 foreign key join은 제한적이므로 2단계 접근.
 */
export async function getMatchesForUser(userId: string) {
  const supabase = createClient();

  // Step 1: userId가 참여한 모든 매치 조회
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, user_a:users!matches_user_a_id_fkey(id, name, avatar_url, bio, region), user_b:users!matches_user_b_id_fkey(id, name, avatar_url, bio, region)"
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error };
  }

  // Step 2: 상대방 정보를 partner 필드로 매핑
  const matchesWithUser: MatchWithUser[] = (data ?? []).map((row) => {
    const isUserA = row.user_a_id === userId;
    const partner = isUserA ? row.user_b : row.user_a;
    return {
      id: row.id,
      user_a_id: row.user_a_id,
      user_b_id: row.user_b_id,
      score: row.score,
      status: row.status,
      created_at: row.created_at,
      partner: partner as MatchWithUser["partner"],
    };
  });

  return { data: matchesWithUser, error: null };
}

/**
 * 매치 상태를 업데이트합니다 (수락 또는 거절).
 */
export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId)
    .select()
    .single();
  return { data: data as Match | null, error };
}

/**
 * 단일 매치를 ID로 조회합니다.
 */
export async function getMatchById(matchId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  return { data: data as Match | null, error };
}
