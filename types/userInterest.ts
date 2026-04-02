// @TASK P2-R2-T1 - UserInterest 타입 정의
// @SPEC docs/planning/04-database-design.md#user_interests

/**
 * public.user_interests 테이블과 1:1 매핑되는 타입.
 * 사용자가 "배우고 싶은 것"을 카테고리별로 등록합니다.
 */
export interface UserInterest {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

/**
 * 새 관심사 생성 시 필요한 데이터.
 * user_id는 API 함수 파라미터로 별도 전달합니다.
 */
export interface CreateUserInterestData {
  category_id: string;
  title: string;
  description?: string;
}
