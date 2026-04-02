// @TASK P2-S2-T1 - Home page
// @SPEC docs/planning/03-user-flow.md#home
// @SPEC specs/screens/home.yaml

'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { useMentoringSessions } from '@/hooks/useMentoringSessions'
import CategoryBadge from '@/components/ui/CategoryBadge'
import SessionCard from '@/components/features/SessionCard'

// ---------------------------------------------------------------------------
// SearchBar
// ---------------------------------------------------------------------------

function SearchBar() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push('/search')}
      className="w-full flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-sm hover:border-[#818CF8] hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
      aria-label="멘토링 검색하기"
    >
      <Search size={18} className="text-[#9CA3AF] flex-shrink-0" aria-hidden="true" />
      <span className="text-sm text-[#9CA3AF] select-none">멘토링을 검색해보세요</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// CategoryScroll
// ---------------------------------------------------------------------------

function CategoryScroll() {
  const router = useRouter()
  const { categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-7 w-20 rounded-full bg-[#F3F4F6] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      role="list"
      aria-label="카테고리 목록"
    >
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => router.push(`/category/${category.id}`)}
          className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-1 rounded-full"
          role="listitem"
          aria-label={`${category.name} 카테고리 보기`}
        >
          <CategoryBadge
            name={category.name}
            icon={category.icon ?? '📂'}
          />
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session grid skeleton
// ---------------------------------------------------------------------------

function SessionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] animate-pulse mb-3" />
          <div className="h-4 bg-[#F3F4F6] rounded animate-pulse mb-2 w-full" />
          <div className="h-4 bg-[#F3F4F6] rounded animate-pulse mb-3 w-3/4" />
          <div className="h-3 bg-[#F3F4F6] rounded animate-pulse w-1/2 mb-1" />
          <div className="h-3 bg-[#F3F4F6] rounded animate-pulse w-2/5" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PopularSection
// ---------------------------------------------------------------------------

function PopularSection() {
  // "popular" = active sessions ordered by created_at desc, take first slice
  const { sessions, isLoading } = useMentoringSessions({ status: 'active' })

  const popular = sessions.slice(0, 6)

  return (
    <section aria-labelledby="popular-heading">
      <h2
        id="popular-heading"
        className="text-base font-semibold text-[#111827] mb-3"
      >
        인기 멘토링
      </h2>

      {isLoading ? (
        <SessionGridSkeleton />
      ) : popular.length === 0 ? (
        <p className="text-sm text-[#6B7280] py-4 text-center">
          등록된 멘토링이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popular.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              title={session.title}
              mentorName={session.mentor_id}
              location={session.location}
              categoryIcon={null}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// RecentSection
// ---------------------------------------------------------------------------

function RecentSection() {
  // "recent" = active sessions ordered by created_at desc (same query, different slice)
  const { sessions, isLoading } = useMentoringSessions({ status: 'active' })

  // Skip first 6 (shown in popular) and take next 6
  const recent = sessions.slice(6, 12)

  return (
    <section aria-labelledby="recent-heading">
      <h2
        id="recent-heading"
        className="text-base font-semibold text-[#111827] mb-3"
      >
        최근 멘토링
      </h2>

      {isLoading ? (
        <SessionGridSkeleton />
      ) : recent.length === 0 ? (
        <p className="text-sm text-[#6B7280] py-4 text-center">
          최근 등록된 멘토링이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recent.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              title={session.title}
              mentorName={session.mentor_id}
              location={session.location}
              categoryIcon={null}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
      {/* SearchBar */}
      <SearchBar />

      {/* Category horizontal scroll */}
      <section aria-label="카테고리">
        <CategoryScroll />
      </section>

      {/* Popular sessions */}
      <PopularSection />

      {/* Recent sessions */}
      <RecentSection />
    </div>
  )
}
