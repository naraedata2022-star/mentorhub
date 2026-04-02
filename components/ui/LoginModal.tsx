// @TASK P1-S0-T1 - LoginModal: overlay shown when unauthenticated user hits restricted action
"use client";

import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-[calc(100%-48px)] max-w-sm p-6">
        <h2
          id="login-modal-title"
          className="text-lg font-bold text-[#111827] text-center mb-2"
        >
          로그인이 필요합니다
        </h2>
        <p className="text-sm text-[#6B7280] text-center mb-6">
          이 기능을 사용하려면 먼저 로그인해 주세요.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#D1D5DB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleLogin}
            className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-sm font-medium text-white hover:bg-[#3730A3] transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
