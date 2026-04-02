// @TASK P2-R1-T1 - UserSkill 타입 정의
// @SPEC docs/planning/04-database-design.md#user_skills

/**
 * user_skills 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, user_id uuid, category_id uuid, title text, description text, created_at timestamptz
 */
export interface UserSkill {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

/**
 * 새 UserSkill 생성 시 클라이언트가 전달하는 데이터.
 * user_id는 API 함수 인자로 별도 전달되므로 포함하지 않는다.
 */
export interface CreateUserSkillData {
  category_id: string;
  title: string;
  description?: string;
}
