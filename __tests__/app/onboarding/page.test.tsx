// @TASK P2-S1-T1 - Onboarding page tests
// @SPEC specs/screens/onboarding.yaml

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// --- Mocks ---
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

const mockCategories = [
  { id: 'cat-1', name: '개발', icon: '💻', sort_order: 1 },
  { id: 'cat-2', name: '디자인', icon: '🎨', sort_order: 2 },
  { id: 'cat-3', name: '마케팅', icon: '📣', sort_order: 3 },
]

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories: mockCategories, isLoading: false }),
}))

const mockAddSkill = jest.fn().mockResolvedValue({ data: { id: 'sk-1' }, error: null })
const mockAddInterest = jest.fn().mockResolvedValue({ data: { id: 'int-1' }, error: null })

jest.mock('@/hooks/useUserSkills', () => ({
  useUserSkills: () => ({ skills: [], addSkill: mockAddSkill, removeSkill: jest.fn() }),
}))

jest.mock('@/hooks/useUserInterests', () => ({
  useUserInterests: () => ({ interests: [], addInterest: mockAddInterest, removeInterest: jest.fn() }),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' }, isLoading: false }),
}))

jest.mock('@/components/ui/CategoryBadge', () => ({
  default: ({ name, icon }: { name: string; icon: string }) => (
    <span data-testid="category-badge">
      {icon} {name}
    </span>
  ),
}))

// Import after mocks
import OnboardingPage from '@/app/onboarding/page'

describe('OnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Step 1 - 카테고리 선택', () => {
    it('renders step 1 indicator on initial load', () => {
      render(<OnboardingPage />)
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('renders categories from useCategories hook', () => {
      render(<OnboardingPage />)
      expect(screen.getByText(/개발/)).toBeInTheDocument()
      expect(screen.getByText(/디자인/)).toBeInTheDocument()
      expect(screen.getByText(/마케팅/)).toBeInTheDocument()
    })

    it('disables 다음 button when fewer than 2 categories selected', () => {
      render(<OnboardingPage />)
      const nextButton = screen.getByRole('button', { name: '다음' })
      expect(nextButton).toBeDisabled()
    })

    it('enables 다음 button after selecting 2 categories', async () => {
      render(<OnboardingPage />)
      const catButtons = screen.getAllByRole('button', { name: /개발|디자인|마케팅/ })
      await userEvent.click(catButtons[0])
      await userEvent.click(catButtons[1])
      const nextButton = screen.getByRole('button', { name: '다음' })
      expect(nextButton).not.toBeDisabled()
    })

    it('shows selected state (aria-pressed) when a category is clicked', async () => {
      render(<OnboardingPage />)
      const catButtons = screen.getAllByRole('button', { name: /개발|디자인|마케팅/ })
      await userEvent.click(catButtons[0])
      expect(catButtons[0]).toHaveAttribute('aria-pressed', 'true')
    })

    it('deselects category on second click', async () => {
      render(<OnboardingPage />)
      const catButtons = screen.getAllByRole('button', { name: /개발|디자인|마케팅/ })
      await userEvent.click(catButtons[0])
      await userEvent.click(catButtons[0])
      expect(catButtons[0]).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Step 2 - 가르칠 수 있는 것', () => {
    async function goToStep2() {
      render(<OnboardingPage />)
      const catButtons = screen.getAllByRole('button', { name: /개발|디자인|마케팅/ })
      await userEvent.click(catButtons[0])
      await userEvent.click(catButtons[1])
      await userEvent.click(screen.getByRole('button', { name: '다음' }))
    }

    it('advances to step 2 after clicking 다음 with 2+ categories', async () => {
      await goToStep2()
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })

    it('renders an input field for each selected category', async () => {
      await goToStep2()
      // 2 categories selected → 2 input sections visible
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('calls addSkill when the add button is clicked with a skill title', async () => {
      await goToStep2()
      const inputs = screen.getAllByRole('textbox')
      await userEvent.type(inputs[0], 'React 기초')
      const addButtons = screen.getAllByRole('button', { name: '추가' })
      await userEvent.click(addButtons[0])
      expect(mockAddSkill).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'React 기초' })
      )
    })
  })

  describe('Step 3 - 배우고 싶은 것 + 지역', () => {
    async function goToStep3() {
      render(<OnboardingPage />)
      const catButtons = screen.getAllByRole('button', { name: /개발|디자인|마케팅/ })
      await userEvent.click(catButtons[0])
      await userEvent.click(catButtons[1])
      await userEvent.click(screen.getByRole('button', { name: '다음' }))
      await userEvent.click(screen.getByRole('button', { name: '다음' }))
    }

    it('advances to step 3', async () => {
      await goToStep3()
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })

    it('renders a region input field', async () => {
      await goToStep3()
      expect(screen.getByPlaceholderText(/지역/)).toBeInTheDocument()
    })

    it('calls addInterest when the add button is clicked', async () => {
      await goToStep3()
      const inputs = screen.getAllByRole('textbox')
      // First textbox may be an interest title input
      await userEvent.type(inputs[0], 'TypeScript')
      const addButtons = screen.getAllByRole('button', { name: '추가' })
      await userEvent.click(addButtons[0])
      expect(mockAddInterest).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'TypeScript' })
      )
    })

    it('shows 완료 button on step 3', async () => {
      await goToStep3()
      expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument()
    })

    it('navigates to / on 완료 click', async () => {
      await goToStep3()
      await userEvent.click(screen.getByRole('button', { name: '완료' }))
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Auth guard', () => {
    it('redirects to /login when user is not authenticated', async () => {
      jest.resetModules()
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({ user: null, isLoading: false }),
      }))
      // Re-import after resetting the module
      const { default: Page } = await import('@/app/onboarding/page')
      render(<Page />)
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login')
      })
    })
  })
})
