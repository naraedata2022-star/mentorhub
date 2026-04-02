// @TASK P1-S0-T1 - MessageBubble: chat message bubble, aligned by sender
interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  createdAt: string;
}

export default function MessageBubble({ content, isMine, createdAt }: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-1.5 ${
        isMine ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Bubble */}
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
          isMine
            ? "bg-[#4F46E5] text-white rounded-br-sm"
            : "bg-[#F3F4F6] text-[#111827] rounded-bl-sm"
        }`}
      >
        {content}
      </div>

      {/* Timestamp */}
      <span className="flex-shrink-0 text-[10px] text-[#6B7280] mb-0.5">
        {createdAt}
      </span>
    </div>
  );
}
