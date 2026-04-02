// @TASK P3-R3-T1 - Messages API 함수
// @SPEC docs/planning/04-database-design.md#messages
// @TEST __tests__/lib/messages.test.ts

import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/message";

/**
 * 특정 채팅방의 메시지 목록을 조회합니다.
 * 기본적으로 오래된 메시지부터 정렬합니다 (채팅 UI 기준).
 *
 * @param chatRoomId - 채팅방 UUID
 * @param options - 선택적 옵션 (limit, offset)
 */
export async function getMessages(
  chatRoomId: string,
  options?: { limit?: number; offset?: number }
) {
  const supabase = createClient();
  let query = supabase
    .from("messages")
    .select("*")
    .eq("chat_room_id", chatRoomId)
    .order("created_at", { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 50) - 1
    );
  }

  const { data, error } = await query;
  return { data: data as Message[] | null, error };
}

/**
 * 메시지를 전송합니다.
 *
 * @param chatRoomId - 채팅방 UUID
 * @param senderId - 발신자 UUID
 * @param content - 메시지 내용
 */
export async function sendMessage(
  chatRoomId: string,
  senderId: string,
  content: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_room_id: chatRoomId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();
  return { data: data as Message | null, error };
}

/**
 * 메시지를 읽음 처리합니다.
 *
 * @param messageId - 메시지 UUID
 */
export async function markAsRead(messageId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .select()
    .single();
  return { data: data as Message | null, error };
}
