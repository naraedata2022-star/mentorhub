// @TASK P1-R3-T1 - Categories API 함수
// @SPEC docs/planning/04-database-design.md#categories
// @TEST __tests__/lib/categories.test.ts

import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/category";

/**
 * 전체 카테고리 목록을 sort_order 오름차순으로 조회합니다.
 *
 * @returns { data: Category[] | null, error } - 카테고리 배열 또는 에러
 */
export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return { data: data as Category[] | null, error };
}

/**
 * 단일 카테고리를 ID로 조회합니다.
 *
 * @param id - 카테고리 UUID
 * @returns { data: Category | null, error } - 카테고리 또는 에러
 */
export async function getCategoryById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as Category | null, error };
}
