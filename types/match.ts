// @TASK P3-R1-T1 - Match 타입 정의
// @SPEC docs/planning/04-database-design.md#matches

/**
 * matches 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, user_a_id uuid, user_b_id uuid,
 *   score double precision, status text,
 *   created_at timestamptz
 */
export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  score: number;
  status: MatchStatus;
  created_at: string;
}

/**
 * 매치 상태 타입.
 * DB check constraint: 'pending' | 'accepted' | 'dismissed'
 */
export type MatchStatus = "pending" | "accepted" | "dismissed";

/**
 * 매치 목록 조회 시 상대방 유저 정보가 조인된 타입.
 * getMatchesForUser에서 사용.
 */
export interface MatchWithUser extends Match {
  partner: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    region: string | null;
  };
}
