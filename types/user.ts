// @TASK P1-R2-T1 - User 타입 정의
// @SPEC docs/planning/04-database-design.md#users

/**
 * public.users 테이블과 1:1 매핑되는 타입.
 * auth.users를 확장하는 프로필 테이블.
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * 프로필 업데이트 시 허용되는 필드.
 * name, bio, region, avatar_url만 수정 가능.
 */
export interface UpdateProfileData {
  name?: string;
  bio?: string;
  region?: string;
  avatar_url?: string;
}

/**
 * 프로필 생성 시 필수 필드.
 * email, name은 필수.
 */
export interface CreateProfileData {
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  region?: string;
}
