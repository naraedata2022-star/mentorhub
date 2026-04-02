// @TASK P3-R2-T1 - ChatRoom 타입 정의
// @SPEC docs/planning/04-database-design.md#chat-rooms

/**
 * chat_rooms 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, created_at timestamptz
 */
export interface ChatRoom {
  id: string;
  created_at: string;
}

/**
 * chat_participants 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, chat_room_id uuid, user_id uuid,
 *   joined_at timestamptz
 *   unique(chat_room_id, user_id)
 */
export interface ChatParticipant {
  id: string;
  chat_room_id: string;
  user_id: string;
  joined_at: string;
}

/**
 * 채팅방 목록 조회 시 상대방 정보와 마지막 메시지가 포함된 타입.
 * getChatRoomsForUser에서 사용.
 */
export interface ChatRoomWithDetails extends ChatRoom {
  partner: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
}
