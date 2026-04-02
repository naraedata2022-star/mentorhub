// @TASK P3-R3-T1 - Realtime Messages React 훅
// @SPEC docs/planning/04-database-design.md#messages

"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/message";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Supabase Realtime을 통해 채팅방의 새 메시지를 실시간으로 수신하는 훅.
 * postgres_changes INSERT 이벤트를 구독하여 새 메시지를 상태에 추가합니다.
 *
 * 주의: 이 훅은 실시간 수신만 담당합니다.
 * 기존 메시지 로딩은 useMessages 훅을 사용하세요.
 *
 * @param chatRoomId - 채팅방 UUID
 * @returns { newMessages, isConnected }
 */
export function useRealtimeMessages(chatRoomId: string) {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!chatRoomId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`room:${chatRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setNewMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [chatRoomId]);

  return { newMessages, isConnected };
}
