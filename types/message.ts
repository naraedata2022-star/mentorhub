// @TASK P3-R3-T1 - Message 타입 정의
// @SPEC docs/planning/04-database-design.md#messages

/**
 * messages 테이블과 1:1 매핑되는 타입.
 * Supabase DB 스키마:
 *   id uuid, chat_room_id uuid, sender_id uuid,
 *   content text, is_read boolean,
 *   created_at timestamptz
 *
 * Realtime 활성화:
 *   alter publication supabase_realtime add table public.messages;
 */
export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
