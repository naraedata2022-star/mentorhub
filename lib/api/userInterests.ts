// @TASK P2-R2-T1 - User Interests API 함수
// @SPEC docs/planning/04-database-design.md#user_interests
// @TEST __tests__/lib/userInterests.test.ts

import { createClient } from "@/lib/supabase/client";
import type { UserInterest, CreateUserInterestData } from "@/types/userInterest";

/**
 * 특정 유저의 전체 관심사 목록을 생성일 내림차순으로 조회합니다.
 *
 * @param userId - 유저 UUID
 * @returns { data: UserInterest[] | null, error } - 관심사 배열 또는 에러
 */
export async function getUserInterests(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_interests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data as UserInterest[] | null, error };
}

/**
 * 새로운 관심사를 생성합니다.
 *
 * @param userId - 유저 UUID
 * @param data - 관심사 데이터 (CreateUserInterestData)
 * @returns { data: UserInterest | null, error } - 생성된 관심사 또는 에러
 */
export async function createUserInterest(
  userId: string,
  data: CreateUserInterestData
) {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("user_interests")
    .insert({
      user_id: userId,
      ...data,
    })
    .select("*")
    .single();
  return { data: result as UserInterest | null, error };
}

/**
 * 관심사를 삭제합니다.
 *
 * @param interestId - 관심사 UUID
 * @returns { error } - 에러 또는 null
 */
export async function deleteUserInterest(interestId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_interests")
    .delete()
    .eq("id", interestId);
  return { error };
}

/**
 * 특정 카테고리에 속하는 관심사 목록을 생성일 내림차순으로 조회합니다.
 *
 * @param categoryId - 카테고리 UUID
 * @returns { data: UserInterest[] | null, error } - 관심사 배열 또는 에러
 */
export async function getUserInterestsByCategory(categoryId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_interests")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  return { data: data as UserInterest[] | null, error };
}
