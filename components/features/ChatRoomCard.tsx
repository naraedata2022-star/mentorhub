// @TASK P1-S0-T1 - ChatRoomCard: chat room list item showing partner info and last message
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface ChatRoomCardProps {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatRoomCard({
  id,
  partnerName,
  partnerAvatar,
  lastMessage,
  lastMessageTime,
  unreadCount,
}: ChatRoomCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F9FAFB] transition-colors active:bg-[#F3F4F6]"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#F3F4F6]">
        {partnerAvatar ? (
          <Image
            src={partnerAvatar}
            alt={`${partnerName} 프로필 사진`}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-[#6B7280]">
            {partnerName.charAt(0)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-sm font-semibold text-[#111827] truncate">
            {partnerName}
          </span>
          <span className="flex-shrink-0 text-[11px] text-[#6B7280] ml-2">
            {lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280] truncate pr-2">{lastMessage}</p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
