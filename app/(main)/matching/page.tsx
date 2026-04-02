// @TASK P3-S1 - Matching page: browse and act on match recommendations
// @SPEC docs/planning/03-user-flow.md#matching

"use client";

import { useRouter } from "next/navigation";
import { Sparkles, MapPin, Star, Check, SkipForward } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { createChatRoom } from "@/lib/api/chatRooms";
import EmptyState from "@/components/ui/EmptyState";
import type { MatchWithUser } from "@/types/match";
import { useEffect } from "react";

// ---------------------------------------------------------------------------
// MatchCard skeleton
// ---------------------------------------------------------------------------

function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#F3F4F6] rounded w-2/5" />
          <div className="h-3 bg-[#F3F4F6] rounded w-1/3" />
        </div>
        <div className="h-9 w-16 bg-[#F3F4F6] rounded-full" />
      </div>
      <div className="h-3 bg-[#F3F4F6] rounded mb-2 w-full" />
      <div className="h-3 bg-[#F3F4F6] rounded w-3/4 mb-4" />
      <div className="flex gap-2 mt-4">
        <div className="h-10 flex-1 bg-[#F3F4F6] rounded-xl" />
        <div className="h-10 flex-1 bg-[#F3F4F6] rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreBadge
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  // Color tiers: high >= 80 indigo, mid >= 60 amber, low orange
  const color =
    pct >= 80
      ? "bg-[#EEF2FF] text-[#4F46E5]"
      : pct >= 60
        ? "bg-amber-50 text-amber-600"
        : "bg-orange-50 text-orange-500";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
      aria-label={`매칭 점수 ${pct}%`}
    >
      <Star size={11} aria-hidden="true" />
      {pct}%
    </span>
  );
}

// ---------------------------------------------------------------------------
// MatchCard
// ---------------------------------------------------------------------------

interface MatchCardProps {
  match: MatchWithUser;
  currentUserId: string;
  onAccept: (matchId: string, partnerId: string) => Promise<void>;
  onDismiss: (matchId: string) => Promise<void>;
  isActing: boolean;
}

function MatchCard({ match, onAccept, onDismiss, isActing }: MatchCardProps) {
  const { partner, score, status } = match;
  const initial = partner.name.charAt(0).toUpperCase();

  const isDone = status === "accepted" || status === "dismissed";

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm p-5 transition-opacity duration-200 ${
        isDone ? "opacity-40 pointer-events-none" : "border-[#E5E7EB]"
      }`}
      aria-label={`${partner.name}와의 매칭 카드`}
    >
      {/* Top row: avatar + name + score */}
      <div className="flex items-center gap-4 mb-3">
        {/* Avatar */}
        <div
          className="relative flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-[#EEF2FF] flex items-center justify-center"
          aria-hidden="true"
        >
          {partner.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partner.avatar_url}
              alt={`${partner.name} 프로필 사진`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-[#4F46E5]">{initial}</span>
          )}
        </div>

        {/* Name + region */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-[#111827] truncate">
            {partner.name}
          </p>
          {partner.region && (
            <p className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5">
              <MapPin size={11} aria-hidden="true" />
              {partner.region}
            </p>
          )}
        </div>

        {/* Score */}
        <ScoreBadge score={score} />
      </div>

      {/* Bio */}
      {partner.bio && (
        <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-2 mb-4">
          {partner.bio}
        </p>
      )}

      {/* Status label for done states */}
      {status === "accepted" && (
        <p className="text-xs text-[#4F46E5] font-medium mb-2">
          수락됨 — 채팅방으로 이동 중...
        </p>
      )}
      {status === "dismissed" && (
        <p className="text-xs text-[#6B7280] font-medium mb-2">건너뜀</p>
      )}

      {/* Action buttons (only when pending) */}
      {status === "pending" && (
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            disabled={isActing}
            onClick={() => onDismiss(match.id)}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors disabled:opacity-50"
            aria-label={`${partner.name} 건너뛰기`}
          >
            <SkipForward size={15} aria-hidden="true" />
            건너뛰기
          </button>
          <button
            type="button"
            disabled={isActing}
            onClick={() => onAccept(match.id, partner.id)}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[#4F46E5] text-sm font-medium text-white hover:bg-[#4338CA] active:bg-[#3730A3] transition-colors disabled:opacity-50"
            aria-label={`${partner.name} 수락`}
          >
            <Check size={15} aria-hidden="true" />
            수락
          </button>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MatchingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { matches, isLoading, acceptMatch, dismissMatch } = useMatches(
    user?.id
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  // Only show pending matches at the top; handled/done appear faded below
  const pending = matches.filter((m) => m.status === "pending");
  const done = matches.filter(
    (m) => m.status === "accepted" || m.status === "dismissed"
  );
  const ordered = [...pending, ...done];

  async function handleAccept(matchId: string, partnerId: string) {
    await acceptMatch(matchId);
    // Create a chat room between current user and partner
    const { data: room } = await createChatRoom([user!.id, partnerId]);
    if (room) {
      router.push(`/chat/${room.id}`);
    }
  }

  async function handleDismiss(matchId: string) {
    await dismissMatch(matchId);
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      {/* Page heading */}
      <div className="mb-1">
        <h1 className="text-xl font-bold text-[#111827]">매칭 추천</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          나와 잘 맞는 멘토/멘티를 만나보세요
        </p>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && matches.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="매칭 결과가 없습니다"
          description="잠시 후 다시 확인해보세요. 새로운 멘토/멘티를 찾고 있습니다."
        />
      )}

      {/* Match cards */}
      {!isLoading && ordered.length > 0 && (
        <div className="space-y-4">
          {ordered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentUserId={user.id}
              onAccept={handleAccept}
              onDismiss={handleDismiss}
              isActing={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
