// @TASK P2-S7 - Profile edit screen
// @SPEC docs/planning/03-user-flow.md#profile-edit
// @TEST __tests__/app/main/profile/edit.test.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

// ── Loading skeleton ──────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div data-testid="edit-loading" className="animate-pulse px-4 pt-4 space-y-6">
      <div className="h-6 w-1/3 rounded bg-[#E5E7EB]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-16 rounded bg-[#E5E7EB]" />
          <div className="h-11 w-full rounded-xl bg-[#E5E7EB]" />
        </div>
      ))}
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────────────

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  error?: string
  placeholder?: string
}

function FormField({ id, label, value, onChange, multiline, error, placeholder }: FieldProps) {
  const inputClass = [
    'w-full px-4 py-3 rounded-xl border text-sm text-[#111827] placeholder:text-[#9CA3AF]',
    'focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition',
    error ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E5E7EB] bg-white',
  ].join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#374151]">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={inputClass + ' resize-none'}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfileEditPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, isLoading } = useProfile(user?.id)
  const { updateProfile, isUpdating } = useUpdateProfile()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [region, setRegion] = useState('')
  const [nameError, setNameError] = useState('')
  const [serverError, setServerError] = useState('')

  // Pre-fill form once profile is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setBio(profile.bio ?? '')
      setRegion(profile.region ?? '')
    }
  }, [profile])

  const validate = (): boolean => {
    setNameError('')
    if (!name.trim()) {
      setNameError('이름을 입력해 주세요.')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    if (!user?.id) return

    setServerError('')
    const result = await updateProfile(user.id, {
      name: name.trim(),
      bio: bio.trim() || undefined,
      region: region.trim() || undefined,
    })

    if (result.error) {
      setServerError(result.error.message)
      return
    }

    router.push('/profile')
  }

  if (isLoading) {
    return <EditSkeleton />
  }

  return (
    <div className="px-4 pt-4 pb-10 max-w-lg mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="p-2 -ml-2 rounded-full hover:bg-[#F3F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
        >
          <ChevronLeft size={22} className="text-[#374151]" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-[#111827]">프로필 수정</h1>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSave() }}
        className="space-y-5"
        noValidate
      >
        <FormField
          id="name"
          label="이름"
          value={name}
          onChange={(v) => { setName(v); setNameError('') }}
          error={nameError}
          placeholder="이름을 입력하세요"
        />

        <FormField
          id="bio"
          label="자기소개"
          value={bio}
          onChange={setBio}
          multiline
          placeholder="자신을 소개해 보세요"
        />

        <FormField
          id="region"
          label="지역"
          value={region}
          onChange={setRegion}
          placeholder="예) 서울, 부산"
        />

        {/* ── Server error ─────────────────────────────────────────────── */}
        {serverError && (
          <p role="alert" className="text-sm text-[#DC2626] text-center">
            {serverError}
          </p>
        )}

        {/* ── Action buttons ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
            style={{ backgroundColor: '#4F46E5' }}
          >
            {isUpdating ? '저장 중...' : '저장'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            disabled={isUpdating}
            className="w-full h-12 rounded-xl text-sm font-semibold text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
