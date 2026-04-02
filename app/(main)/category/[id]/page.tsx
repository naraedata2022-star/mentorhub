// @TASK P2-S3 - Category Detail: sessions filtered by category
// @SPEC docs/planning/03-user-flow.md#category-detail
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, MapPin, Calendar } from "lucide-react";
import { useMentoringSessions } from "@/hooks/useMentoringSessions";
import { getCategoryById } from "@/lib/api/categories";
import EmptyState from "@/components/ui/EmptyState";
import type { Category } from "@/types/category";
import type { MentoringSession } from "@/types/mentoringSession";

const STATUS_LABEL: Record<MentoringSession["status"], string> = {
  active: "모집 중",
  closed: "마감",
  completed: "완료",
};

const STATUS_COLOR: Record<MentoringSession["status"], string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  closed: "bg-[#FEE2E2] text-[#991B1B]",
  completed: "bg-[#E5E7EB] text-[#374151]",
};

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const { sessions, isLoading: sessionsLoading } = useMentoringSessions({
    categoryId: id,
  });

  useEffect(() => {
    if (!id) return;
    setCategoryLoading(true);
    getCategoryById(id)
      .then(({ data }) => {
        setCategory(data);
      })
      .finally(() => setCategoryLoading(false));
  }, [id]);

  const isLoading = categoryLoading || sessionsLoading;

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로 가기"
        className="flex items-center gap-1 py-3 text-[#6B7280] hover:text-[#374151] transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">뒤로</span>
      </button>

      {/* Category header */}
      <div className="flex items-center gap-3 mb-6">
        {categoryLoading ? (
          <div className="h-10 w-48 bg-[#E5E7EB] rounded-lg animate-pulse" />
        ) : category ? (
          <>
            {category.icon && (
              <span
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEF2FF] text-2xl"
                aria-hidden="true"
              >
                {category.icon}
              </span>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#111827]">
                {category.name}
              </h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {sessionsLoading ? "..." : `${sessions.length}개의 멘토링`}
              </p>
            </div>
          </>
        ) : (
          <h1 className="text-xl font-bold text-[#111827]">카테고리</h1>
        )}
      </div>

      {/* Session list */}
      {isLoading ? (
        <ul className="space-y-3" aria-label="로딩 중">
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className="h-28 bg-white rounded-2xl border border-[#E5E7EB] animate-pulse"
            />
          ))}
        </ul>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="아직 멘토링이 없습니다"
          description="이 카테고리에 등록된 멘토링이 없습니다."
        />
      ) : (
        <ul className="space-y-3" aria-label="멘토링 목록">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/mentoring/${session.id}`}
                className="block bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:border-[#C7D2FE] hover:shadow-sm transition-all active:scale-[0.98]"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm font-semibold text-[#111827] line-clamp-2 flex-1">
                    {session.title}
                  </h2>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[session.status]}`}
                  >
                    {STATUS_LABEL[session.status]}
                  </span>
                </div>

                {/* Description */}
                {session.description && (
                  <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">
                    {session.description}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  {session.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} aria-hidden="true" />
                      {session.location}
                    </span>
                  )}
                  {session.schedule && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} aria-hidden="true" />
                      {session.schedule}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
