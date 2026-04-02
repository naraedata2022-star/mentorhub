// @TASK P3-R2-T1 - Chat Rooms API 함수
// @SPEC docs/planning/04-database-design.md#chat-rooms
// @TEST __tests__/lib/chatRooms.test.ts

import { createClient } from "@/lib/supabase/client";
import type {
  ChatRoom,
  ChatParticipant,
  ChatRoomWithDetails,
} from "@/types/chatRoom";

/**
 * 특정 사용자가 참여 중인 채팅방 목록을 조회합니다.
 * 상대방 정보와 마지막 메시지가 포함됩니다.
 *
 * 전략:
 * 1. chat_participants에서 userId가 참여한 chat_room_id 목록 조회
 * 2. 각 채팅방의 상대 참여자 정보 조인
 * 3. 각 채팅방의 마지막 메시지 조회
 */
export async function getChatRoomsForUser(userId: string) {
  const supabase = createClient();

  // Step 1: 사용자가 참여한 채팅방 ID 목록 조회
  const { data: participations, error: partError } = await supabase
    .from("chat_participants")
    .select("chat_room_id")
    .eq("user_id", userId);

  if (partError) {
    return { data: null, error: partError };
  }

  if (!participations || participations.length === 0) {
    return { data: [] as ChatRoomWithDetails[], error: null };
  }

  const roomIds = participations.map(
    (p: { chat_room_id: string }) => p.chat_room_id
  );

  // Step 2: 채팅방 정보 + 참여자 정보 조회
  const { data: rooms, error: roomError } = await supabase
    .from("chat_rooms")
    .select(
      "*, chat_participants(user_id, users:users(id, name, avatar_url)), messages(content, created_at, sender_id)"
    )
    .in("id", roomIds)
    .order("created_at", { ascending: false });

  if (roomError) {
    return { data: null, error: roomError };
  }

  // Step 3: partner와 last_message 매핑
  const chatRoomsWithDetails: ChatRoomWithDetails[] = (rooms ?? []).map(
    (room) => {
      // 상대방 참여자 찾기
      const participants = room.chat_participants as Array<{
        user_id: string;
        users: { id: string; name: string; avatar_url: string | null };
      }>;
      const partnerParticipant = participants.find(
        (p) => p.user_id !== userId
      );
      const partner = partnerParticipant?.users ?? {
        id: "",
        name: "Unknown",
        avatar_url: null,
      };

      // 마지막 메시지 찾기 (messages 배열에서 최신 것)
      const messages = room.messages as Array<{
        content: string;
        created_at: string;
        sender_id: string;
      }>;
      const sortedMessages = [...messages].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastMessage = sortedMessages[0] ?? null;

      return {
        id: room.id,
        created_at: room.created_at,
        partner,
        last_message: lastMessage,
      };
    }
  );

  return { data: chatRoomsWithDetails, error: null };
}

/**
 * 새로운 채팅방을 생성하고 참여자를 추가합니다.
 *
 * @param userIds - 채팅방에 참여할 유저 ID 배열 (보통 2명)
 */
export async function createChatRoom(userIds: string[]) {
  const supabase = createClient();

  // Step 1: 채팅방 생성
  const { data: room, error: roomError } = await supabase
    .from("chat_rooms")
    .insert({})
    .select()
    .single();

  if (roomError || !room) {
    return { data: null, error: roomError };
  }

  // Step 2: 참여자 추가
  const participants = userIds.map((uid) => ({
    chat_room_id: room.id,
    user_id: uid,
  }));

  const { error: partError } = await supabase
    .from("chat_participants")
    .insert(participants);

  if (partError) {
    return { data: null, error: partError };
  }

  return { data: room as ChatRoom, error: null };
}

/**
 * 단일 채팅방을 ID로 조회합니다.
 * 참여자 정보가 조인됩니다.
 */
export async function getChatRoomById(chatRoomId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_rooms")
    .select("*, chat_participants(id, chat_room_id, user_id, joined_at)")
    .eq("id", chatRoomId)
    .single();

  if (error) {
    return { data: null, participants: null, error };
  }

  const participants = (data?.chat_participants ?? []) as ChatParticipant[];
  const room: ChatRoom = {
    id: data.id,
    created_at: data.created_at,
  };

  return { data: room, participants, error: null };
}
