// @TASK P1-S2 - Auth 레이아웃 (로그인/회원가입 공통)
// @SPEC docs/planning/06-screens.md

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {children}
    </div>
  );
}
