// @TASK P3-R2-T1 - Chat Rooms React 훅
// @SPEC docs/planning/04-database-design.md#chat-rooms

"use client";

import { useCallback, useEffect, useState } from "react";
import { getChatRoomsForUser } from "@/lib/api/chatRooms";
import type { ChatRoomWithDetails } from "@/types/chatRoom";

/**
 * 사용자가 참여 중인 채팅방 목록을 조회하는 훅.
 * 상대방 정보와 마지막 메시지가 포함됩니다.
 *
 * @param userId - 사용자 UUID (없으면 조회하지 않음)
 * @returns { chatRooms, isLoading, error, refetch }
 */
export function useChatRooms(userId?: string) {
  const [chatRooms, setChatRooms] = useState<ChatRoomWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatRooms = useCallback(async () => {
    if (!userId) {
      setChatRooms([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getChatRoomsForUser(userId);
      if (err) {
        setError(err.message);
        setChatRooms([]);
      } else {
        setChatRooms(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return { chatRooms, isLoading, error, refetch: fetchChatRooms };
}
