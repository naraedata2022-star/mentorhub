// @TASK P2-S1-T1 - Onboarding 3-step wizard
// @SPEC specs/screens/onboarding.yaml

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { useUserSkills } from '@/hooks/useUserSkills'
import { useUserInterests } from '@/hooks/useUserInterests'
import CategoryBadge from '@/components/ui/CategoryBadge'
import type { Category } from '@/types/category'

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < current
                ? 'w-8 bg-[#4F46E5]'
                : i === current - 1
                ? 'w-8 bg-[#4F46E5]'
                : 'w-4 bg-[#E5E7EB]'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[#6B7280]">
        {current} / {total}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 – 카테고리 선택
// ---------------------------------------------------------------------------
interface Step1Props {
  categories: Category[]
  isLoading: boolean
  selected: Set<string>
  onToggle: (id: string) => void
  onNext: () => void
}

function Step1({ categories, isLoading, selected, onToggle, onNext }: Step1Props) {
  const canProceed = selected.size >= 2

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">관심 분야 선택</h1>
      <p className="text-sm text-[#6B7280] mb-6">최소 2개 이상 선택해 주세요</p>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isSelected = selected.has(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(cat.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                  isSelected
                    ? 'border-[#4F46E5] bg-[#EEF2FF]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#C7D2FE]'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {cat.icon ?? '📌'}
                </span>
                <CategoryBadge name={cat.name} icon="" />
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-8">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-[#4F46E5] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SkillRow – reusable input row for Step 2 and Step 3
// ---------------------------------------------------------------------------
interface SkillRowProps {
  category: Category
  placeholder?: string
  onAdd: (categoryId: string, title: string) => Promise<void>
}

function SkillRow({ category, placeholder = '제목을 입력하세요', onAdd }: SkillRowProps) {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAdd() {
    const trimmed = value.trim()
    if (!trimmed) return
    setIsSubmitting(true)
    await onAdd(category.id, trimmed)
    setValue('')
    setIsSubmitting(false)
  }

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden="true">
          {category.icon ?? '📌'}
        </span>
        <span className="text-sm font-semibold text-[#374151]">{category.name}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] placeholder:text-[#9CA3AF]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSubmitting || !value.trim()}
          className="px-4 py-2.5 text-sm font-medium text-white bg-[#4F46E5] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          추가
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 – 가르칠 수 있는 것
// ---------------------------------------------------------------------------
interface Step2Props {
  selectedCategories: Category[]
  addSkill: (data: { category_id: string; title: string }) => Promise<unknown>
  onNext: () => void
}

function Step2({ selectedCategories, addSkill, onNext }: Step2Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">가르칠 수 있는 것</h1>
      <p className="text-sm text-[#6B7280] mb-6">
        선택한 카테고리별로 가르칠 수 있는 것을 추가해 보세요
      </p>

      {selectedCategories.map((cat) => (
        <SkillRow
          key={cat.id}
          category={cat}
          placeholder="예: React 기초, 포토샵 입문..."
          onAdd={(categoryId, title) =>
            addSkill({ category_id: categoryId, title }) as Promise<void>
          }
        />
      ))}

      <div className="mt-8">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-[#4F46E5]"
        >
          다음
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 – 배우고 싶은 것 + 지역
// ---------------------------------------------------------------------------
interface Step3Props {
  selectedCategories: Category[]
  addInterest: (data: { category_id: string; title: string }) => Promise<unknown>
  onComplete: (region: string) => void
}

function Step3({ selectedCategories, addInterest, onComplete }: Step3Props) {
  const [region, setRegion] = useState('')

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">배우고 싶은 것</h1>
      <p className="text-sm text-[#6B7280] mb-6">
        배우고 싶은 것과 활동 지역을 입력해 주세요
      </p>

      {selectedCategories.map((cat) => (
        <SkillRow
          key={cat.id}
          category={cat}
          placeholder="예: TypeScript, 브랜드 디자인..."
          onAdd={(categoryId, title) =>
            addInterest({ category_id: categoryId, title }) as Promise<void>
          }
        />
      ))}

      <div className="mb-8">
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          활동 지역
        </label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="지역을 입력하세요 (예: 서울, 부산)"
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] placeholder:text-[#9CA3AF]"
        />
      </div>

      <button
        type="button"
        onClick={() => onComplete(region)}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-[#4F46E5]"
      >
        완료
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OnboardingPage (main export)
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { categories, isLoading: catsLoading } = useCategories()
  const { addSkill } = useUserSkills(user?.id)
  const { addInterest } = useUserInterests(user?.id)

  const [step, setStep] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const selectedCategories = categories.filter((c) => selectedIds.has(c.id))

  function toggleCategory(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleComplete(region: string) {
    // region could be saved via a profile update hook (future task)
    void region
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
        <StepIndicator current={step} total={3} />

        {step === 1 && (
          <Step1
            categories={categories}
            isLoading={catsLoading}
            selected={selectedIds}
            onToggle={toggleCategory}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2
            selectedCategories={selectedCategories}
            addSkill={addSkill}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <Step3
            selectedCategories={selectedCategories}
            addInterest={addInterest}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  )
}
