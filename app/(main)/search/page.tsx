// @TASK P2-S5 - Search: debounced session search
// @SPEC docs/planning/03-user-flow.md#search
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, MapPin, Calendar } from "lucide-react";
import { searchSessions } from "@/lib/api/mentoringSessions";
import EmptyState from "@/components/ui/EmptyState";
import type { MentoringSession } from "@/types/mentoringSession";

const STATUS_COLOR: Record<MentoringSession["status"], string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  closed: "bg-[#FEE2E2] text-[#991B1B]",
  completed: "bg-[#E5E7EB] text-[#374151]",
};

const STATUS_LABEL: Record<MentoringSession["status"], string> = {
  active: "모집 중",
  closed: "마감",
  completed: "완료",
};

type SearchState = "idle" | "loading" | "done";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MentoringSession[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearchState("idle");
      return;
    }

    setSearchState("loading");

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchSessions(trimmed);
        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearchState("done");
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setSearchState("idle");
    inputRef.current?.focus();
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      {/* Search input */}
      <div className="relative flex items-center mb-5">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="멘토링 검색"
          aria-label="멘토링 검색"
          className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF] transition-all"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={clearQuery}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#9CA3AF] hover:text-[#374151] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Content area */}
      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <Search size={40} className="text-[#D1D5DB]" aria-hidden="true" />
          <p className="text-sm text-[#9CA3AF] mt-2">
            멘토링 제목이나 설명을 검색해보세요
          </p>
        </div>
      ) : searchState === "loading" ? (
        <ul className="space-y-3" aria-label="검색 중">
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className="h-28 bg-white rounded-2xl border border-[#E5E7EB] animate-pulse"
            />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="검색 결과가 없습니다"
          description={`"${query.trim()}"에 해당하는 멘토링이 없습니다.`}
        />
      ) : (
        <>
          <p className="text-xs text-[#9CA3AF] mb-3">
            {results.length}개의 결과
          </p>
          <ul className="space-y-3" aria-label="검색 결과">
            {results.map((session) => (
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
        </>
      )}
    </div>
  );
}
