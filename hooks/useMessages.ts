// @TASK P3-R3-T1 - Messages React 훅
// @SPEC docs/planning/04-database-design.md#messages

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMessages,
  sendMessage as sendMessageApi,
} from "@/lib/api/messages";
import type { Message } from "@/types/message";

/**
 * 특정 채팅방의 메시지 목록을 조회하고 메시지 전송 기능을 제공하는 훅.
 *
 * @param chatRoomId - 채팅방 UUID
 * @returns { messages, isLoading, error, sendMessage, refetch }
 */
export function useMessages(chatRoomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatRoomId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getMessages(chatRoomId);
      if (err) {
        setError(err.message);
        setMessages([]);
      } else {
        setMessages(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (senderId: string, content: string) => {
      try {
        const { data, error: err } = await sendMessageApi(
          chatRoomId,
          senderId,
          content
        );
        if (err) {
          setError(err.message);
          return;
        }
        // 로컬 상태에 즉시 추가 (optimistic update)
        if (data) {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [chatRoomId]
  );

  return { messages, isLoading, error, sendMessage, refetch: fetchMessages };
}
