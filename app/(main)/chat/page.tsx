// @TASK P3-S2 - Chat list page: view all active chat rooms
// @SPEC docs/planning/03-user-flow.md#chat-list

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatRooms } from "@/hooks/useChatRooms";
import ChatRoomCard from "@/components/features/ChatRoomCard";
import EmptyState from "@/components/ui/EmptyState";

// ---------------------------------------------------------------------------
// ChatRoomCard skeleton
// ---------------------------------------------------------------------------

function ChatRoomSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white animate-pulse">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F3F4F6]" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-3.5 bg-[#F3F4F6] rounded w-1/3" />
          <div className="h-3 bg-[#F3F4F6] rounded w-10" />
        </div>
        <div className="h-3 bg-[#F3F4F6] rounded w-2/3" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format ISO timestamp to a human-friendly relative label. */
function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChatListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { chatRooms, isLoading } = useChatRooms(user?.id);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Page heading */}
      <div className="px-4 py-5 border-b border-[#E5E7EB] bg-white">
        <h1 className="text-xl font-bold text-[#111827]">채팅</h1>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="divide-y divide-[#F3F4F6]">
          {[0, 1, 2, 3].map((i) => (
            <ChatRoomSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && chatRooms.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="채팅이 없습니다"
          description="매칭을 수락하면 상대방과 채팅을 시작할 수 있어요."
        />
      )}

      {/* Chat room list */}
      {!isLoading && chatRooms.length > 0 && (
        <ul
          className="divide-y divide-[#F3F4F6]"
          aria-label="채팅 목록"
          role="list"
        >
          {chatRooms.map((room) => {
            const lastMsg = room.last_message?.content ?? "";
            const lastTime = room.last_message
              ? formatTime(room.last_message.created_at)
              : "";

            return (
              <li key={room.id} role="listitem">
                <ChatRoomCard
                  id={room.id}
                  partnerName={room.partner.name}
                  partnerAvatar={room.partner.avatar_url ?? ""}
                  lastMessage={lastMsg}
                  lastMessageTime={lastTime}
                  unreadCount={0}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
