// @TASK P1-S0-T1 - TabBar: bottom tab navigation
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Sparkles, MessageCircle, User } from "lucide-react";

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TAB_ITEMS: TabItem[] = [
  { label: "홈", href: "/", icon: Home },
  { label: "검색", href: "/search", icon: Search },
  { label: "매칭", href: "/matching", icon: Sparkles },
  { label: "채팅", href: "/chat", icon: MessageCircle },
  { label: "프로필", href: "/profile", icon: User },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] h-16">
      <ul className="flex h-full">
        {TAB_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center justify-center h-full gap-1"
              >
                <Icon
                  size={22}
                  className={isActive ? "text-[#4F46E5]" : "text-[#6B7280]"}
                />
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive ? "text-[#4F46E5]" : "text-[#6B7280]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
