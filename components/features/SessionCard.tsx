// @TASK P2-S2-T1 - SessionCard: displays a mentoring session and navigates to detail page
// @SPEC docs/planning/03-user-flow.md#home

'use client'

import { useRouter } from 'next/navigation'
import { MapPin, User } from 'lucide-react'

interface SessionCardProps {
  id: string
  title: string
  mentorName: string
  location: string | null
  categoryIcon: string | null
}

export default function SessionCard({
  id,
  title,
  mentorName,
  location,
  categoryIcon,
}: SessionCardProps) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push(`/mentoring/${id}`)}
      className="w-full text-left bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#818CF8] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
      aria-label={`${title} 멘토링 세션 보기`}
    >
      {/* Category icon badge */}
      {categoryIcon && (
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#EEF2FF] text-lg mb-3"
          aria-hidden="true"
        >
          {categoryIcon}
        </span>
      )}

      {/* Title */}
      <p className="text-sm font-semibold text-[#111827] leading-snug mb-2 line-clamp-2">
        {title}
      </p>

      {/* Mentor name */}
      <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-1">
        <User size={12} aria-hidden="true" />
        <span>{mentorName}</span>
      </div>

      {/* Location */}
      {location && (
        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
          <MapPin size={12} aria-hidden="true" />
          <span className="truncate">{location}</span>
        </div>
      )}
    </button>
  )
}
