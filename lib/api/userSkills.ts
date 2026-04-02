// @TASK P2-R1-T1 - User Skills API 함수
// @SPEC docs/planning/04-database-design.md#user_skills
// @TEST __tests__/lib/userSkills.test.ts

import { createClient } from "@/lib/supabase/client";
import type { UserSkill, CreateUserSkillData } from "@/types/userSkill";

/**
 * 특정 사용자의 전체 스킬 목록을 생성일 내림차순으로 조회합니다.
 *
 * @param userId - 대상 사용자 UUID
 * @returns { data: UserSkill[] | null, error } - 스킬 배열 또는 에러
 */
export async function getUserSkills(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data as UserSkill[] | null, error };
}

/**
 * 새로운 사용자 스킬을 생성합니다.
 *
 * @param userId - 대상 사용자 UUID
 * @param skillData - 생성할 스킬 데이터 (category_id, title, description?)
 * @returns { data: UserSkill | null, error } - 생성된 스킬 또는 에러
 */
export async function createUserSkill(
  userId: string,
  skillData: CreateUserSkillData
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_skills")
    .insert({ user_id: userId, ...skillData })
    .select()
    .single();
  return { data: data as UserSkill | null, error };
}

/**
 * 스킬을 ID로 삭제합니다.
 *
 * @param skillId - 삭제할 스킬 UUID
 * @returns { error } - 에러 또는 null
 */
export async function deleteUserSkill(skillId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_skills")
    .delete()
    .eq("id", skillId);
  return { error };
}

/**
 * 특정 카테고리에 속하는 전체 스킬을 조회합니다 (멘토 매칭용).
 * user_id에 관계없이 해당 카테고리의 모든 스킬을 반환합니다.
 *
 * @param categoryId - 카테고리 UUID
 * @returns { data: UserSkill[] | null, error } - 스킬 배열 또는 에러
 */
export async function getUserSkillsByCategory(categoryId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_skills")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  return { data: data as UserSkill[] | null, error };
}
