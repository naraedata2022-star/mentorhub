// @TASK P2-R3-T1 - MentoringSession 타입 정의
// @SPEC docs/planning/04-database-design.md#mentoring-sessions

/**
 * mentoring_sessions 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, mentor_id uuid, category_id uuid, title text,
 *   description text, location text, schedule text, status text,
 *   created_at timestamptz, updated_at timestamptz
 */
export interface MentoringSession {
  id: string;
  mentor_id: string;
  category_id: string;
  title: string;
  description: string | null;
  location: string | null;
  schedule: string | null;
  status: "active" | "closed" | "completed";
  created_at: string;
  updated_at: string;
}

/**
 * 멘토링 세션 상세 조회 시 mentor 정보가 조인된 타입.
 * getSessionById에서 사용.
 */
export interface MentoringSessionWithMentor extends MentoringSession {
  mentor: {
    id: string;
    name: string;
    avatar_url: string | null;
    region: string | null;
  };
}

/**
 * 멘토링 세션 생성 시 필요한 데이터.
 * mentor_id는 별도 파라미터로 전달.
 */
export interface CreateSessionData {
  category_id: string;
  title: string;
  description?: string;
  location?: string;
  schedule?: string;
}

/**
 * 멘토링 세션 상태 타입.
 * DB check constraint: 'active' | 'closed' | 'completed'
 */
export type SessionStatus = "active" | "closed" | "completed";
