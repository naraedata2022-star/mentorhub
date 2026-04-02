// @TASK P2-S6 - Profile screen
// @SPEC docs/planning/03-user-flow.md#profile
// @TEST __tests__/app/main/profile/page.test.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, BookOpen, Lightbulb, LogOut, Pencil, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useUserSkills } from '@/hooks/useUserSkills'
import { useUserInterests } from '@/hooks/useUserInterests'
import CategoryBadge from '@/components/ui/CategoryBadge'
import EmptyState from '@/components/ui/EmptyState'

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover ring-2 ring-[#4F46E5]/20"
      />
    )
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
      style={{ backgroundColor: '#4F46E5' }}
      aria-label={name}
    >
      {name.charAt(0)}
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div data-testid="profile-loading" className="animate-pulse px-4 pt-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-[#E5E7EB]" />
        <div className="h-5 w-32 rounded bg-[#E5E7EB]" />
        <div className="h-4 w-48 rounded bg-[#E5E7EB]" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-[#E5E7EB]" />
        <div className="h-4 w-3/4 rounded bg-[#E5E7EB]" />
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string
  items: Array<{ id: string; title: string; category?: { name: string; icon: string | null } | null }>
  emptyTitle: string
  emptyDescription: string
  emptyIcon: LucideIcon
}

function BadgeSection({ title, items, emptyTitle, emptyDescription, emptyIcon }: SectionProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[#111827] mb-3">{title}</h2>
      {items.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <CategoryBadge
              key={item.id}
              name={item.title}
              icon={item.category?.icon ?? ''}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, signOut } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile(user?.id)
  const { skills } = useUserSkills(user?.id)
  const { interests } = useUserInterests(user?.id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (profileLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-6 max-w-lg mx-auto">
      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-[#F3F4F6] p-5 flex flex-col items-center gap-3 text-center"
      >
        <Avatar name={profile?.name ?? user?.email ?? '?'} avatarUrl={profile?.avatar_url ?? null} />

        <div className="space-y-0.5">
          <p className="text-lg font-bold text-[#111827] leading-tight">
            {profile?.name ?? ''}
          </p>
          <p className="text-sm text-[#6B7280]">{profile?.email ?? user?.email ?? ''}</p>
        </div>

        {profile?.region && (
          <div className="flex items-center gap-1 text-sm text-[#6B7280]">
            <MapPin size={14} aria-hidden="true" />
            <span>{profile.region}</span>
          </div>
        )}

        {profile?.bio && (
          <p className="text-sm text-[#374151] leading-relaxed">{profile.bio}</p>
        )}
      </div>

      {/* ── Skills ───────────────────────────────────────────────────── */}
      <BadgeSection
        title="가르칠 수 있는 것"
        items={skills}
        emptyTitle="등록된 스킬이 없습니다"
        emptyDescription="내가 가르칠 수 있는 것을 추가해 보세요."
        emptyIcon={BookOpen}
      />

      {/* ── Interests ────────────────────────────────────────────────── */}
      <BadgeSection
        title="배우고 싶은 것"
        items={interests}
        emptyTitle="등록된 관심사가 없습니다"
        emptyDescription="배우고 싶은 것을 추가해 보세요."
        emptyIcon={Lightbulb}
      />

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/profile/edit')}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
          style={{ backgroundColor: '#4F46E5' }}
        >
          <Pencil size={16} aria-hidden="true" />
          프로필 수정
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-[#DC2626] bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
        >
          <LogOut size={16} aria-hidden="true" />
          로그아웃
        </button>
      </div>
    </div>
  )
}
