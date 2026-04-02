// @TASK P2-S6 - Profile page tests
// @SPEC specs/screens/profile.yaml

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── next/navigation ──────────────────────────────────────────────────────────
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

// ── hooks ────────────────────────────────────────────────────────────────────
const mockSignOut = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/hooks/useProfile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('@/hooks/useUserSkills', () => ({
  useUserSkills: jest.fn(),
}))

jest.mock('@/hooks/useUserInterests', () => ({
  useUserInterests: jest.fn(),
}))

// ── child components ─────────────────────────────────────────────────────────
jest.mock('@/components/ui/CategoryBadge', () => ({
  default: ({ name, icon }: { name: string; icon: string }) => (
    <span data-testid="category-badge">{icon} {name}</span>
  ),
}))

jest.mock('@/components/ui/EmptyState', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
}))

import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useUserSkills } from '@/hooks/useUserSkills'
import { useUserInterests } from '@/hooks/useUserInterests'
import ProfilePage from '@/app/(main)/profile/page'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>
const mockUseUserSkills = useUserSkills as jest.MockedFunction<typeof useUserSkills>
const mockUseUserInterests = useUserInterests as jest.MockedFunction<typeof useUserInterests>

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

const baseSkill = {
  id: 'skill-1',
  user_id: 'user-1',
  category_id: 'cat-1',
  title: 'React 기초',
  description: null,
  created_at: '2024-01-01T00:00:00Z',
  category: { id: 'cat-1', name: '프로그래밍', icon: '💻', sort_order: 1 },
}

const baseInterest = {
  id: 'interest-1',
  user_id: 'user-1',
  category_id: 'cat-2',
  title: '디자인 기초',
  description: null,
  created_at: '2024-01-01T00:00:00Z',
  category: { id: 'cat-2', name: '디자인', icon: '🎨', sort_order: 2 },
}

function setupDefaults() {
  mockUseAuth.mockReturnValue({
    user: baseUser,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInOAuth: jest.fn(),
    signOut: mockSignOut,
  })
  mockUseProfile.mockReturnValue({
    profile: baseProfile,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })
  mockUseUserSkills.mockReturnValue({
    skills: [baseSkill],
    isLoading: false,
    error: null,
    addSkill: jest.fn(),
    removeSkill: jest.fn(),
    refetch: jest.fn(),
  })
  mockUseUserInterests.mockReturnValue({
    interests: [baseInterest],
    isLoading: false,
    error: null,
    addInterest: jest.fn(),
    removeInterest: jest.fn(),
    refetch: jest.fn(),
  })
}

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupDefaults()
  })

  // ── 인증되지 않은 사용자 ────────────────────────────────────────────────
  describe('Unauthenticated redirect', () => {
    it('redirects to /login when user is null and not loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInOAuth: jest.fn(),
        signOut: jest.fn(),
      })
      render(<ProfilePage />)
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })

    it('does not redirect while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: true,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInOAuth: jest.fn(),
        signOut: jest.fn(),
      })
      render(<ProfilePage />)
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  // ── 프로필 정보 렌더링 ─────────────────────────────────────────────────
  describe('Profile information rendering', () => {
    it('renders user name', () => {
      render(<ProfilePage />)
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    it('renders user email', () => {
      render(<ProfilePage />)
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('renders user bio', () => {
      render(<ProfilePage />)
      expect(screen.getByText('안녕하세요, 개발자입니다.')).toBeInTheDocument()
    })

    it('renders user region', () => {
      render(<ProfilePage />)
      expect(screen.getByText('서울')).toBeInTheDocument()
    })

    it('renders avatar initial when no avatar_url', () => {
      render(<ProfilePage />)
      // First letter of name '홍길동' → '홍'
      expect(screen.getByText('홍')).toBeInTheDocument()
    })

    it('renders avatar image when avatar_url is present', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...baseProfile, avatar_url: 'https://example.com/avatar.jpg' },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
      render(<ProfilePage />)
      const img = screen.getByRole('img', { name: /홍길동/ })
      expect(img).toBeInTheDocument()
    })
  })

  // ── 스킬/관심사 섹션 ──────────────────────────────────────────────────
  describe('Skills and interests sections', () => {
    it('renders 가르칠 수 있는 것 section heading', () => {
      render(<ProfilePage />)
      expect(screen.getByText('가르칠 수 있는 것')).toBeInTheDocument()
    })

    it('renders 배우고 싶은 것 section heading', () => {
      render(<ProfilePage />)
      expect(screen.getByText('배우고 싶은 것')).toBeInTheDocument()
    })

    it('renders skill CategoryBadge', () => {
      render(<ProfilePage />)
      expect(screen.getByText(/React 기초/)).toBeInTheDocument()
    })

    it('renders interest CategoryBadge', () => {
      render(<ProfilePage />)
      expect(screen.getByText(/디자인 기초/)).toBeInTheDocument()
    })

    it('shows EmptyState when skills are empty', () => {
      mockUseUserSkills.mockReturnValue({
        skills: [],
        isLoading: false,
        error: null,
        addSkill: jest.fn(),
        removeSkill: jest.fn(),
        refetch: jest.fn(),
      })
      render(<ProfilePage />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('shows EmptyState when interests are empty', () => {
      mockUseUserInterests.mockReturnValue({
        interests: [],
        isLoading: false,
        error: null,
        addInterest: jest.fn(),
        removeInterest: jest.fn(),
        refetch: jest.fn(),
      })
      render(<ProfilePage />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
  })

  // ── 액션 버튼 ────────────────────────────────────────────────────────
  describe('Action buttons', () => {
    it('renders 프로필 수정 button', () => {
      render(<ProfilePage />)
      expect(screen.getByRole('button', { name: '프로필 수정' })).toBeInTheDocument()
    })

    it('navigates to /profile/edit when 프로필 수정 is clicked', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '프로필 수정' }))
      expect(mockPush).toHaveBeenCalledWith('/profile/edit')
    })

    it('renders 로그아웃 button', () => {
      render(<ProfilePage />)
      expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    })

    it('calls signOut and navigates to /login when 로그아웃 is clicked', async () => {
      mockSignOut.mockResolvedValue({ error: null })
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })
  })

  // ── 로딩 상태 ────────────────────────────────────────────────────────
  describe('Loading state', () => {
    it('shows loading skeleton when profile is loading', () => {
      mockUseProfile.mockReturnValue({
        profile: null,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      })
      render(<ProfilePage />)
      expect(screen.getByTestId('profile-loading')).toBeInTheDocument()
    })
  })
})
