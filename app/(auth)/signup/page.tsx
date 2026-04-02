"use client";

// @TASK P1-S2-T1 - 회원가입 페이지 UI
// @SPEC specs/screens/signup.yaml
// @TEST __tests__/app/signup/page.test.tsx

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithOAuth } from "@/lib/supabase/auth";

// --- 유효성 검사 ---
interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

function validateForm(
  name: string,
  email: string,
  password: string,
  passwordConfirm: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!name.trim()) {
    errors.name = "이름을 입력해 주세요.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!emailRegex.test(email)) {
    errors.email = "올바른 이메일 형식을 입력해 주세요.";
  }

  if (!password) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (password.length < 6) {
    errors.password = "비밀번호는 6자 이상이어야 합니다.";
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}

// --- 메인 컴포넌트 ---
export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- 폼 제출 ---
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const errors = validateForm(name, email, password, passwordConfirm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsLoading(true);

    try {
      const { error } = await signUpWithEmail(email, password, name);
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push("/onboarding");
    } finally {
      setIsLoading(false);
    }
  }

  // --- 소셜 회원가입 ---
  async function handleSocialSignup(provider: "google" | "kakao") {
    setServerError(null);
    await signInWithOAuth(provider);
  }

  return (
    <div className="w-full max-w-sm">
      {/* 로고 / 타이틀 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-600">MentorHub</h1>
        <p className="mt-2 text-sm text-gray-500">새 계정을 만들어 보세요</p>
      </div>

      {/* 서버 에러 */}
      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 이름 */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!validationErrors.name}
            aria-describedby={
              validationErrors.name ? "name-error" : undefined
            }
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${
              validationErrors.name
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="홍길동"
          />
          {validationErrors.name && (
            <p id="name-error" role="alert" className="mt-1 text-xs text-red-600">
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!validationErrors.email}
            aria-describedby={
              validationErrors.email ? "email-error" : undefined
            }
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${
              validationErrors.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="example@email.com"
          />
          {validationErrors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!validationErrors.password}
            aria-describedby={
              validationErrors.password ? "password-error" : undefined
            }
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${
              validationErrors.password
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="6자 이상 입력"
          />
          {validationErrors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label
            htmlFor="passwordConfirm"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            aria-invalid={!!validationErrors.passwordConfirm}
            aria-describedby={
              validationErrors.passwordConfirm
                ? "passwordConfirm-error"
                : undefined
            }
            className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${
              validationErrors.passwordConfirm
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="비밀번호를 다시 입력"
          />
          {validationErrors.passwordConfirm && (
            <p
              id="passwordConfirm-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {validationErrors.passwordConfirm}
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "처리 중..." : "회원가입"}
        </button>
      </form>

      {/* 구분선 */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-400">또는</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* 소셜 회원가입 */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleSocialSignup("google")}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Google로 계속하기
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignup("kakao")}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-yellow-400 bg-yellow-400 py-2.5 text-sm font-medium text-yellow-900 hover:bg-yellow-500 transition"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="9" cy="8.25" rx="9" ry="8.25" fill="#3A1D1D" />
            <path
              d="M9 3C6.239 3 4 4.79 4 7c0 1.41.9 2.65 2.25 3.39L5.7 12.5a.25.25 0 0 0 .36.28L8.4 11.4c.19.02.39.04.6.04 2.761 0 5-1.79 5-4s-2.239-4-5-4z"
              fill="#FFE500"
            />
          </svg>
          Kakao로 계속하기
        </button>
      </div>

      {/* 로그인 링크 */}
      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 transition"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
