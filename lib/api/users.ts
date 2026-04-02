// @TASK P1-R2-T1 - Users API 함수
// @SPEC docs/planning/04-database-design.md#users
// @TEST __tests__/lib/users.test.ts

import { createClient } from "@/lib/supabase/client";
import type {
  UserProfile,
  UpdateProfileData,
  CreateProfileData,
} from "@/types/user";

/**
 * 유저 프로필을 ID로 조회합니다.
 *
 * @param userId - 유저 UUID (auth.users.id)
 * @returns { data: UserProfile | null, error }
 */
export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return { data: data as UserProfile | null, error };
}

/**
 * 유저 프로필을 업데이트합니다.
 * name, bio, region, avatar_url 필드만 수정 가능합니다.
 *
 * @param userId - 유저 UUID
 * @param data - 업데이트할 데이터 (UpdateProfileData)
 * @returns { data: UserProfile | null, error }
 */
export async function updateProfile(userId: string, data: UpdateProfileData) {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("users")
    .update(data)
    .eq("id", userId)
    .select("*")
    .single();
  return { data: result as UserProfile | null, error };
}

/**
 * 새 유저 프로필을 생성합니다.
 * email과 name은 필수입니다.
 *
 * @param userId - 유저 UUID (auth.users.id와 동일해야 함)
 * @param data - 프로필 데이터 (CreateProfileData)
 * @returns { data: UserProfile | null, error }
 */
export async function createProfile(userId: string, data: CreateProfileData) {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      ...data,
    })
    .select("*")
    .single();
  return { data: result as UserProfile | null, error };
}

/**
 * 아바타 이미지를 Supabase Storage에 업로드합니다.
 * 파일은 avatars/{userId}/{timestamp}_{filename} 경로에 저장됩니다.
 *
 * @param userId - 유저 UUID
 * @param file - 업로드할 파일 (File 객체)
 * @returns { data: { publicUrl: string } | null, error }
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{
  data: { publicUrl: string } | null;
  error: { message: string; name: string; status: number } | null;
}> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { data: null, error: uploadError as { message: string; name: string; status: number } };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

  return { data: { publicUrl }, error: null };
}
