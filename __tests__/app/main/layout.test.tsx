// @TASK P2-S1-T1 - (main) layout tests
// @SPEC specs/screens/home.yaml

import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

jest.mock('@/components/layout/TabBar', () => ({
  default: () => <nav data-testid="tab-bar">TabBar</nav>,
}))

jest.mock('@/components/layout/AppHeader', () => ({
  default: () => <header data-testid="app-header">AppHeader</header>,
}))

import MainLayout from '@/app/(main)/layout'

describe('MainLayout', () => {
  it('renders AppHeader', () => {
    render(<MainLayout><div>content</div></MainLayout>)
    expect(screen.getByTestId('app-header')).toBeInTheDocument()
  })

  it('renders TabBar', () => {
    render(<MainLayout><div>content</div></MainLayout>)
    expect(screen.getByTestId('tab-bar')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<MainLayout><div>hello world</div></MainLayout>)
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })
})
