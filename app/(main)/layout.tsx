// @TASK P2-S2-T1 - (main) layout with AppHeader and TabBar
// @SPEC docs/planning/03-user-flow.md

import AppHeader from '@/components/layout/AppHeader'
import TabBar from '@/components/layout/TabBar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppHeader />
      {/* pt-14: clears fixed AppHeader (h-14); pb-16: clears fixed TabBar (h-16) */}
      <main className="flex-1 pt-14 pb-16 bg-[#F9FAFB] min-h-screen">
        {children}
      </main>
      <TabBar />
    </>
  )
}
