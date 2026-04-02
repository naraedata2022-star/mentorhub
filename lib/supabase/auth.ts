// @TASK P1-R1-T1 - Supabase Auth 헬퍼 함수
// @SPEC docs/planning/02-trd.md#인증-API
// @TEST __tests__/lib/auth.test.ts

import { createClient } from "@/lib/supabase/client";

/**
 * 이메일/비밀번호로 로그인합니다.
 *
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @returns Supabase AuthResponse (data, error)
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * 이메일/비밀번호로 회원가입합니다.
 * name은 user_metadata에 저장됩니다.
 *
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @param name - 사용자 이름 (user_metadata.name)
 * @returns Supabase AuthResponse (data, error)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
}

/**
 * OAuth 소셜 로그인을 시작합니다.
 * 지원 프로바이더: google, kakao
 *
 * @param provider - OAuth 프로바이더 ('google' | 'kakao')
 * @returns Supabase OAuthResponse (data, error)
 */
export async function signInWithOAuth(provider: "google" | "kakao") {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

/**
 * 현재 세션에서 로그아웃합니다.
 *
 * @returns { error } - 에러가 있으면 반환
 */
export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

/**
 * 현재 세션을 조회합니다.
 *
 * @returns Supabase SessionResponse (data.session, error)
 */
export async function getSession() {
  const supabase = createClient();
  return supabase.auth.getSession();
}

/**
 * 현재 인증된 사용자를 조회합니다.
 * 서버에서 토큰을 검증하므로 getSession보다 안전합니다.
 *
 * @returns Supabase UserResponse (data.user, error)
 */
export async function getUser() {
  const supabase = createClient();
  return supabase.auth.getUser();
}
