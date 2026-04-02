// @TASK P2-S4 - Mentoring Detail: session info + apply button
// @SPEC docs/planning/03-user-flow.md#mentoring-detail
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getSessionById } from "@/lib/api/mentoringSessions";
import { applyToSession } from "@/lib/api/sessionApplications";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "@/components/ui/LoginModal";
import type { MentoringSessionWithMentor } from "@/types/mentoringSession";

const STATUS_LABEL: Record<MentoringSessionWithMentor["status"], string> = {
  active: "모집 중",
  closed: "마감",
  completed: "완료",
};

const STATUS_COLOR: Record<MentoringSessionWithMentor["status"], string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  closed: "bg-[#FEE2E2] text-[#991B1B]",
  completed: "bg-[#E5E7EB] text-[#374151]",
};

export default function MentoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();

  const [session, setSession] = useState<MentoringSessionWithMentor | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [applyError, setApplyError] = useState<string | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setFetchError(null);
    getSessionById(id)
      .then(({ data, error }) => {
        if (error) {
          setFetchError(error.message);
        } else {
          setSession(data);
        }
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : "오류가 발생했습니다");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!session) return;

    setIsApplying(true);
    setApplyResult("idle");
    setApplyError(null);

    const { error } = await applyToSession(session.id, user.id);
    if (error) {
      setApplyResult("error");
      setApplyError(error.message);
    } else {
      setApplyResult("success");
    }
    setIsApplying(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top nav bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] h-14">
        <div className="flex items-center h-full px-4 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
            className="p-2 -ml-2 rounded-full hover:bg-[#F3F4F6] transition-colors"
          >
            <ArrowLeft size={22} className="text-[#374151]" />
          </button>
          <span className="ml-2 text-base font-semibold text-[#111827] truncate">
            멘토링 상세
          </span>
        </div>
      </header>

      {/* Main content — padded for fixed header + sticky footer button */}
      <main className="pt-14 pb-24 max-w-lg mx-auto px-4">
        {isLoading ? (
          <div className="space-y-4 mt-6">
            <div className="h-8 w-2/3 bg-[#E5E7EB] rounded-lg animate-pulse" />
            <div className="h-4 w-1/3 bg-[#E5E7EB] rounded-lg animate-pulse" />
            <div className="h-32 bg-[#E5E7EB] rounded-2xl animate-pulse mt-6" />
            <div className="h-24 bg-[#E5E7EB] rounded-2xl animate-pulse" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <AlertCircle size={40} className="text-[#EF4444]" />
            <p className="text-sm text-[#6B7280]">
              멘토링 정보를 불러오지 못했습니다.
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-2 text-sm text-[#4F46E5] underline underline-offset-2"
            >
              돌아가기
            </button>
          </div>
        ) : !session ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <AlertCircle size={40} className="text-[#D1D5DB]" />
            <p className="text-sm text-[#6B7280]">
              해당 멘토링을 찾을 수 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Status + Title */}
            <div>
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${STATUS_COLOR[session.status]}`}
              >
                {STATUS_LABEL[session.status]}
              </span>
              <h1 className="text-xl font-bold text-[#111827] leading-snug">
                {session.title}
              </h1>
            </div>

            {/* Mentor card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3">
              {session.mentor.avatar_url ? (
                <img
                  src={session.mentor.avatar_url}
                  alt={`${session.mentor.name} 프로필 사진`}
                  className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#E5E7EB]"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <User size={22} className="text-[#4F46E5]" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {session.mentor.name}
                </p>
                {session.mentor.region && (
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <MapPin size={11} aria-hidden="true" />
                    {session.mentor.region}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {session.description && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
                <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  소개
                </h2>
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                  {session.description}
                </p>
              </div>
            )}

            {/* Session info */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
              <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                멘토링 정보
              </h2>

              {session.location && (
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <MapPin
                    size={16}
                    className="text-[#4F46E5] shrink-0"
                    aria-hidden="true"
                  />
                  <span>{session.location}</span>
                </div>
              )}

              {session.schedule && (
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <Calendar
                    size={16}
                    className="text-[#4F46E5] shrink-0"
                    aria-hidden="true"
                  />
                  <span>{session.schedule}</span>
                </div>
              )}

              {!session.location && !session.schedule && (
                <p className="text-sm text-[#9CA3AF]">
                  장소/일정 정보가 없습니다.
                </p>
              )}
            </div>

            {/* Apply result feedback */}
            {applyResult === "success" && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-2xl bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-3 text-sm font-medium text-[#065F46]"
              >
                <CheckCircle size={16} aria-hidden="true" />
                멘토링 신청이 완료되었습니다!
              </div>
            )}

            {applyResult === "error" && applyError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] px-4 py-3 text-sm font-medium text-[#991B1B]"
              >
                <AlertCircle size={16} aria-hidden="true" />
                {applyError}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky apply button */}
      {!isLoading && session && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleApply}
            disabled={
              isApplying ||
              session.status !== "active" ||
              applyResult === "success"
            }
            aria-busy={isApplying}
            className="w-full py-4 rounded-2xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#3730A3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isApplying
              ? "신청 중..."
              : applyResult === "success"
                ? "신청 완료"
                : session.status !== "active"
                  ? "신청 마감"
                  : "멘토링 신청"}
          </button>
        </div>
      )}

      {/* Login modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
