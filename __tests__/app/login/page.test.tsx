// @TASK P1-S1-T2 - 로그인 페이지 통합 테스트
// @SPEC specs/screens/login.yaml
// @TEST __tests__/app/login/page.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginPage from "@/app/(auth)/login/page";

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock lib/supabase/auth
const mockSignInWithEmail = jest.fn();
const mockSignInWithOAuth = jest.fn();
jest.mock("@/lib/supabase/auth", () => ({
  signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
  signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- 렌더링 ---
  describe("Form rendering", () => {
    it("renders the MentorHub logo/title", () => {
      render(<LoginPage />);
      expect(screen.getByText("MentorHub")).toBeInTheDocument();
    });

    it("renders the email input field", () => {
      render(<LoginPage />);
      expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    });

    it("renders the password input field", () => {
      render(<LoginPage />);
      expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    });

    it("renders the login submit button", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: "로그인" })
      ).toBeInTheDocument();
    });

    it("renders Google social login button", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: /google/i })
      ).toBeInTheDocument();
    });

    it("renders Kakao social login button", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: /kakao/i })
      ).toBeInTheDocument();
    });

    it("renders the signup link", () => {
      render(<LoginPage />);
      const signupLink = screen.getByRole("link", { name: /회원가입/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/signup");
    });

    it("renders the divider text '또는'", () => {
      render(<LoginPage />);
      expect(screen.getByText("또는")).toBeInTheDocument();
    });
  });

  // --- 유효성 검사 오류 ---
  describe("Validation errors", () => {
    it("shows error when email is empty on submit", async () => {
      render(<LoginPage />);
      const submitButton = screen.getByRole("button", { name: "로그인" });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/이메일을 입력해 주세요/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error for invalid email format", async () => {
      render(<LoginPage />);
      await userEvent.type(screen.getByLabelText("이메일"), "not-an-email");
      await userEvent.type(screen.getByLabelText("비밀번호"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));
      await waitFor(() => {
        expect(
          screen.getByText(/올바른 이메일 형식을 입력해 주세요/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when password is empty on submit", async () => {
      render(<LoginPage />);
      await userEvent.type(
        screen.getByLabelText("이메일"),
        "test@example.com"
      );
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));
      await waitFor(() => {
        expect(
          screen.getByText(/비밀번호를 입력해 주세요/i)
        ).toBeInTheDocument();
      });
    });

    it("does not call signInWithEmail when validation fails", async () => {
      render(<LoginPage />);
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));
      await waitFor(() => {
        expect(mockSignInWithEmail).not.toHaveBeenCalled();
      });
    });
  });

  // --- 성공적인 제출 ---
  describe("Successful submission", () => {
    it("calls signInWithEmail with correct arguments", async () => {
      mockSignInWithEmail.mockResolvedValue({
        data: { user: { id: "user-1" }, session: { access_token: "token" } },
        error: null,
      });

      render(<LoginPage />);
      await userEvent.type(
        screen.getByLabelText("이메일"),
        "test@example.com"
      );
      await userEvent.type(screen.getByLabelText("비밀번호"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith(
          "test@example.com",
          "password123"
        );
      });
    });

    it("navigates to / on successful login", async () => {
      mockSignInWithEmail.mockResolvedValue({
        data: { user: { id: "user-1" }, session: { access_token: "token" } },
        error: null,
      });

      render(<LoginPage />);
      await userEvent.type(
        screen.getByLabelText("이메일"),
        "test@example.com"
      );
      await userEvent.type(screen.getByLabelText("비밀번호"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  // --- 서버 에러 ---
  describe("Server error handling", () => {
    it("shows server error message when signInWithEmail returns an error", async () => {
      mockSignInWithEmail.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      render(<LoginPage />);
      await userEvent.type(
        screen.getByLabelText("이메일"),
        "wrong@example.com"
      );
      await userEvent.type(screen.getByLabelText("비밀번호"), "wrongpass");
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(
          screen.getByText("Invalid login credentials")
        ).toBeInTheDocument();
      });
    });
  });

  // --- 로딩 상태 ---
  describe("Loading state", () => {
    it("disables submit button while loading", async () => {
      // signInWithEmail은 promise를 반환하지만 resolve되지 않아 로딩 상태 유지
      mockSignInWithEmail.mockImplementation(() => new Promise(() => {}));

      render(<LoginPage />);
      await userEvent.type(
        screen.getByLabelText("이메일"),
        "test@example.com"
      );
      await userEvent.type(screen.getByLabelText("비밀번호"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "로그인" }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /처리 중/i })
        ).toBeDisabled();
      });
    });
  });

  // --- 소셜 로그인 ---
  describe("Social login", () => {
    it("calls signInWithOAuth with google when Google button is clicked", async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: "google", url: "https://accounts.google.com" },
        error: null,
      });

      render(<LoginPage />);
      fireEvent.click(screen.getByRole("button", { name: /google/i }));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
      });
    });

    it("calls signInWithOAuth with kakao when Kakao button is clicked", async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: "kakao", url: "https://kauth.kakao.com" },
        error: null,
      });

      render(<LoginPage />);
      fireEvent.click(screen.getByRole("button", { name: /kakao/i }));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith("kakao");
      });
    });

    it("shows error when OAuth fails", async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: "google", url: null },
        error: { message: "OAuth provider unavailable" },
      });

      render(<LoginPage />);
      fireEvent.click(screen.getByRole("button", { name: /google/i }));

      await waitFor(() => {
        expect(
          screen.getByText("OAuth provider unavailable")
        ).toBeInTheDocument();
      });
    });
  });
});
