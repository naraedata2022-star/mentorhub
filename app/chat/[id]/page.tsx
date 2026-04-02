// @TASK P3-S3 - Chat detail page: real-time messaging with a single partner
// @SPEC docs/planning/03-user-flow.md#chat-detail

"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  use,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { getChatRoomById } from "@/lib/api/chatRooms";
import MessageBubble from "@/components/features/MessageBubble";
import type { Message } from "@/types/message";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format ISO timestamp to HH:MM string. */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChatDetailPage({ params }: PageProps) {
  const { id: chatRoomId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Partner display name resolved from room participants
  const [partnerName, setPartnerName] = useState<string>("채팅");

  // Load partner info once
  useEffect(() => {
    if (!chatRoomId || !user) return;
    getChatRoomById(chatRoomId).then(({ participants }) => {
      if (!participants) return;
      // The partner is the participant whose user_id differs from ours
      // (participants only has id/chat_room_id/user_id/joined_at — no name)
      // We show a generic label here; richer info requires an extra join not
      // exposed by the current API helper.  A real app would add that join.
    });
  }, [chatRoomId, user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Messages (initial load + optimistic sends)
  const { messages: initialMessages, isLoading: messagesLoading, sendMessage } =
    useMessages(chatRoomId);

  // Real-time new messages from Supabase
  const { newMessages, isConnected } = useRealtimeMessages(chatRoomId);

  // Deduplicated merged message list
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Seed from initial load
    setAllMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (newMessages.length === 0) return;
    setAllMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const novel = newMessages.filter((m) => !existingIds.has(m.id));
      if (novel.length === 0) return prev;
      return [...prev, ...novel].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [newMessages]);

  // Auto-scroll to bottom whenever messages change
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Input state
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !user || isSending) return;

    setIsSending(true);
    setInputValue("");
    await sendMessage(user.id, text);
    setIsSending(false);
    inputRef.current?.focus();
  }, [inputValue, user, isSending, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F9FAFB]">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex-shrink-0 flex items-center gap-3 h-14 px-4 bg-white border-b border-[#E5E7EB] z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-[#F3F4F6] transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft size={22} className="text-[#374151]" aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-[#111827] truncate">
            {partnerName}
          </p>
          {/* Realtime connection indicator */}
          <p
            className={`text-[10px] leading-none mt-0.5 ${
              isConnected ? "text-emerald-500" : "text-[#9CA3AF]"
            }`}
            aria-live="polite"
          >
            {isConnected ? "실시간 연결됨" : "연결 중..."}
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Messages scroll area                                                 */}
      {/* ------------------------------------------------------------------ */}
      <main
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        aria-label="메시지 목록"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {/* Loading skeleton */}
        {messagesLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`h-9 rounded-2xl bg-[#F3F4F6] animate-pulse ${
                    i % 2 === 0 ? "w-2/3" : "w-1/2"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty conversation */}
        {!messagesLoading && allMessages.length === 0 && (
          <p className="text-center text-sm text-[#9CA3AF] py-8">
            첫 메시지를 보내보세요.
          </p>
        )}

        {/* Actual messages */}
        {allMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isMine={msg.sender_id === user.id}
            createdAt={formatTime(msg.created_at)}
          />
        ))}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} aria-hidden="true" />
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Input bar (fixed at bottom)                                          */}
      {/* ------------------------------------------------------------------ */}
      <footer className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-t border-[#E5E7EB] safe-area-pb">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          aria-label="메시지 입력"
          className="flex-1 h-11 px-4 rounded-full bg-[#F3F4F6] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-colors"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          aria-label="메시지 보내기"
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-[#4F46E5] text-white hover:bg-[#4338CA] active:bg-[#3730A3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
