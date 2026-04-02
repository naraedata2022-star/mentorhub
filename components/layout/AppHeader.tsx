// @TASK P1-S0-T1 - AppHeader: fixed top header with logo and notification bell
import { Bell } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] h-14">
      <div className="flex items-center justify-between h-full px-4">
        <span className="text-lg font-bold text-[#4F46E5] tracking-tight">
          MentorHub
        </span>
        <button
          type="button"
          aria-label="알림"
          className="p-2 rounded-full hover:bg-[#F3F4F6] transition-colors"
        >
          <Bell size={22} className="text-[#374151]" />
        </button>
      </div>
    </header>
  );
}
