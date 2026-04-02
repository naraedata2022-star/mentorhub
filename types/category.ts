// @TASK P1-R3-T1 - Category 타입 정의
// @SPEC docs/planning/04-database-design.md#categories

/**
 * categories 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, name text unique, icon text, sort_order integer
 */
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}
