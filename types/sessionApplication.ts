// @TASK P2-R4-T1 - SessionApplication 타입 정의
// @SPEC docs/planning/04-database-design.md#session-applications

/**
 * session_applications 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, session_id uuid, applicant_id uuid,
 *   status text ('pending' | 'accepted' | 'rejected'),
 *   created_at timestamptz
 */
export interface SessionApplication {
  id: string;
  session_id: string;
  applicant_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

/**
 * 신청 목록 조회 시 applicant 정보가 조인된 타입.
 * getApplicationsBySession에서 사용.
 */
export interface SessionApplicationWithApplicant extends SessionApplication {
  applicant: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

/**
 * 사용자의 신청 목록 조회 시 session 정보가 조인된 타입.
 * getApplicationsByUser에서 사용.
 */
export interface SessionApplicationWithSession extends SessionApplication {
  session: {
    id: string;
    title: string;
    status: string;
  };
}

/**
 * 멘토링 신청 상태 타입.
 * DB check constraint: 'pending' | 'accepted' | 'rejected'
 */
export type ApplicationStatus = "pending" | "accepted" | "rejected";
