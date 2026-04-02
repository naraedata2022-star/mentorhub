// @TASK P2-S7 - Profile edit page tests
// @SPEC specs/screens/profile-edit.yaml

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ── next/navigation ──────────────────────────────────────────────────────────
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}))

// ── hooks ────────────────────────────────────────────────────────────────────
const mockUpdateProfile = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/hooks/useProfile', () => ({
  useProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import ProfileEditPage from '@/app/(main)/profile/edit/page'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>
const mockUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>

const baseUser = { id: 'user-1', email: 'test@example.com' } as ReturnType<typeof useAuth>['user']

const baseProfile = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  avatar_url: null,
  bio: '안녕하세요, 개발자입니다.',
  region: '서울',
  latitude: null,
  longitude: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function setupDefaults() {
  mockUseAuth.mockReturnValue({
    user: baseUser,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInOAuth: jest.fn(),
    signOut: jest.fn(),
  })
  mockUseProfile.mockReturnValue({
    profile: baseProfile,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })
  mockUseUpdateProfile.mockReturnValue({
    updateProfile: mockUpdateProfile,
    isUpdating: false,
    error: null,
  })
}

describe('ProfileEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupDefaults()
  })

  // ── 렌더링 ────────────────────────────────────────────────────────────
  describe('Form rendering', () => {
    it('renders back arrow button', () => {
      render(<ProfileEditPage />)
      expect(screen.getByRole('button', { name: /뒤로/i })).toBeInTheDocument()
    })

    it('renders page title', () => {
      render(<ProfileEditPage />)
      expect(screen.getByText('프로필 수정')).toBeInTheDocument()
    })

    it('renders name input pre-filled with current name', () => {
      render(<ProfileEditPage />)
      const nameInput = screen.getByLabelText('이름')
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveValue('홍길동')
    })

    it('renders bio textarea pre-filled with current bio', () => {
      render(<ProfileEditPage />)
      const bioInput = screen.getByLabelText('자기소개')
      expect(bioInput).toBeInTheDocument()
      expect(bioInput).toHaveValue('안녕하세요, 개발자입니다.')
    })

    it('renders region input pre-filled with current region', () => {
      render(<ProfileEditPage />)
      const regionInput = screen.getByLabelText('지역')
      expect(regionInput).toBeInTheDocument()
      expect(regionInput).toHaveValue('서울')
    })

    it('renders 저장 button', () => {
      render(<ProfileEditPage />)
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    })

    it('renders 취소 button', () => {
      render(<ProfileEditPage />)
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    })
  })

  // ── 필드 수정 ────────────────────────────────────────────────────────
  describe('Field editing', () => {
    it('allows editing the name field', async () => {
      render(<ProfileEditPage />)
      const nameInput = screen.getByLabelText('이름')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, '김철수')
      expect(nameInput).toHaveValue('김철수')
    })

    it('allows editing the bio field', async () => {
      render(<ProfileEditPage />)
      const bioInput = screen.getByLabelText('자기소개')
      await userEvent.clear(bioInput)
      await userEvent.type(bioInput, '새로운 소개입니다.')
      expect(bioInput).toHaveValue('새로운 소개입니다.')
    })

    it('allows editing the region field', async () => {
      render(<ProfileEditPage />)
      const regionInput = screen.getByLabelText('지역')
      await userEvent.clear(regionInput)
      await userEvent.type(regionInput, '부산')
      expect(regionInput).toHaveValue('부산')
    })
  })

  // ── 저장 ──────────────────────────────────────────────────────────────
  describe('Save action', () => {
    it('calls updateProfile with correct data on 저장 click', async () => {
      mockUpdateProfile.mockResolvedValue({ data: baseProfile, error: null })
      render(<ProfileEditPage />)
      fireEvent.click(screen.getByRole('button', { name: '저장' }))
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith('user-1', {
          name: '홍길동',
          bio: '안녕하세요, 개발자입니다.',
          region: '서울',
        })
      })
    })

    it('navigates to /profile after successful save', async () => {
      mockUpdateProfile.mockResolvedValue({ data: baseProfile, error: null })
      render(<ProfileEditPage />)
      fireEvent.click(screen.getByRole('button', { name: '저장' }))
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile')
      })
    })

    it('shows validation error when name is empty', async () => {
      render(<ProfileEditPage />)
      const nameInput = screen.getByLabelText('이름')
      await userEvent.clear(nameInput)
      fireEvent.click(screen.getByRole('button', { name: '저장' }))
      await waitFor(() => {
        expect(screen.getByText(/이름을 입력해 주세요/i)).toBeInTheDocument()
      })
      expect(mockUpdateProfile).not.toHaveBeenCalled()
    })
  })

  // ── 취소 ──────────────────────────────────────────────────────────────
  describe('Cancel action', () => {
    it('calls router.back() when 취소 is clicked', () => {
      render(<ProfileEditPage />)
      fireEvent.click(screen.getByRole('button', { name: '취소' }))
      expect(mockBack).toHaveBeenCalled()
    })

    it('calls router.back() when back arrow is clicked', () => {
      render(<ProfileEditPage />)
      fireEvent.click(screen.getByRole('button', { name: /뒤로/i }))
      expect(mockBack).toHaveBeenCalled()
    })
  })

  // ── 로딩 상태 ─────────────────────────────────────────────────────────
  describe('Loading state', () => {
    it('disables 저장 button while isUpdating is true', () => {
      mockUseUpdateProfile.mockReturnValue({
        updateProfile: mockUpdateProfile,
        isUpdating: true,
        error: null,
      })
      render(<ProfileEditPage />)
      expect(screen.getByRole('button', { name: /저장 중/i })).toBeDisabled()
    })

    it('shows loading skeleton while profile data is loading', () => {
      mockUseProfile.mockReturnValue({
        profile: null,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      })
      render(<ProfileEditPage />)
      expect(screen.getByTestId('edit-loading')).toBeInTheDocument()
    })
  })

  // ── 서버 에러 ─────────────────────────────────────────────────────────
  describe('Server error', () => {
    it('shows server error message when updateProfile returns error', async () => {
      mockUpdateProfile.mockResolvedValue({
        data: null,
        error: { message: '업데이트에 실패했습니다.' },
      })
      render(<ProfileEditPage />)
      fireEvent.click(screen.getByRole('button', { name: '저장' }))
      await waitFor(() => {
        expect(screen.getByText('업데이트에 실패했습니다.')).toBeInTheDocument()
      })
    })
  })
})
