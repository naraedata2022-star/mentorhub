// @TASK P1-S2-T2 - 회원가입 페이지 통합 테스트
// @SPEC specs/screens/signup.yaml
// @TEST __tests__/app/signup/page.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignupPage from "@/app/(auth)/signup/page";

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
const mockSignUpWithEmail = jest.fn();
const mockSignInWithOAuth = jest.fn();
jest.mock("@/lib/supabase/auth", () => ({
  signUpWithEmail: (...args: unknown[]) => mockSignUpWithEmail(...args),
  signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
}));

// Helper to fill in the signup form with valid data
function fillValidForm() {
  fireEvent.change(screen.getByLabelText("이름"), {
    target: { value: "테스트유저" },
  });
  fireEvent.change(screen.getByLabelText("이메일"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호"), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
    target: { value: "password123" },
  });
}

describe("SignupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- 렌더링 ---
  describe("Form rendering", () => {
    it("renders the MentorHub logo/title", () => {
      render(<SignupPage />);
      expect(screen.getByText("MentorHub")).toBeInTheDocument();
    });

    it("renders the name input field", () => {
      render(<SignupPage />);
      expect(screen.getByLabelText("이름")).toBeInTheDocument();
    });

    it("renders the email input field", () => {
      render(<SignupPage />);
      expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    });

    it("renders the password input field", () => {
      render(<SignupPage />);
      expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    });

    it("renders the password confirm input field", () => {
      render(<SignupPage />);
      expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument();
    });

    it("renders the signup submit button", () => {
      render(<SignupPage />);
      expect(
        screen.getByRole("button", { name: "회원가입" })
      ).toBeInTheDocument();
    });

    it("renders Google social signup button", () => {
      render(<SignupPage />);
      expect(
        screen.getByRole("button", { name: /google/i })
      ).toBeInTheDocument();
    });

    it("renders Kakao social signup button", () => {
      render(<SignupPage />);
      expect(
        screen.getByRole("button", { name: /kakao/i })
      ).toBeInTheDocument();
    });

    it("renders the login link with correct href", () => {
      render(<SignupPage />);
      const loginLink = screen.getByRole("link", { name: /로그인/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("renders the divider text '또는'", () => {
      render(<SignupPage />);
      expect(screen.getByText("또는")).toBeInTheDocument();
    });
  });

  // --- 유효성 검사 오류 ---
  describe("Validation errors", () => {
    it("shows error when name is empty on submit", async () => {
      render(<SignupPage />);
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
      await waitFor(() => {
        expect(
          screen.getByText(/이름을 입력해 주세요/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error for invalid email format", async () => {
      render(<SignupPage />);
      fireEvent.change(screen.getByLabelText("이름"), {
        target: { value: "테스트유저" },
      });
      fireEvent.change(screen.getByLabelText("이메일"), {
        target: { value: "not-an-email" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
      await waitFor(() => {
        expect(
          screen.getByText(/올바른 이메일 형식을 입력해 주세요/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when password is shorter than 6 characters", async () => {
      render(<SignupPage />);
      fireEvent.change(screen.getByLabelText("이름"), {
        target: { value: "테스트유저" },
      });
      fireEvent.change(screen.getByLabelText("이메일"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호"), {
        target: { value: "12345" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
        target: { value: "12345" },
      });
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
      await waitFor(() => {
        expect(
          screen.getByText(/비밀번호는 6자 이상이어야 합니다/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when passwords do not match", async () => {
      render(<SignupPage />);
      fireEvent.change(screen.getByLabelText("이름"), {
        target: { value: "테스트유저" },
      });
      fireEvent.change(screen.getByLabelText("이메일"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
        target: { value: "differentpassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
      await waitFor(() => {
        expect(
          screen.getByText(/비밀번호가 일치하지 않습니다/i)
        ).toBeInTheDocument();
      });
    });

    it("does not call signUpWithEmail when validation fails", async () => {
      render(<SignupPage />);
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
      await waitFor(() => {
        expect(mockSignUpWithEmail).not.toHaveBeenCalled();
      });
    });
  });

  // --- 성공적인 제출 ---
  describe("Successful submission", () => {
    it("calls signUpWithEmail with correct arguments", async () => {
      mockSignUpWithEmail.mockResolvedValue({
        data: { user: { id: "user-1" }, session: null },
        error: null,
      });

      render(<SignupPage />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
          "테스트유저"
        );
      });
    });

    it("navigates to /onboarding on successful signup", async () => {
      mockSignUpWithEmail.mockResolvedValue({
        data: { user: { id: "user-1" }, session: null },
        error: null,
      });

      render(<SignupPage />);
      fillValidForm();
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/onboarding");
      });
    });
  });

  // --- 서버 에러 ---
  describe("Server error handling", () => {
    it("shows server error message when signUpWithEmail returns an error", async () => {
      mockSignUpWithEmail.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "User already registered" },
      });

      render(<SignupPage />);
      fireEvent.change(screen.getByLabelText("이름"), {
        target: { value: "기존유저" },
      });
      fireEvent.change(screen.getByLabelText("이메일"), {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

      await waitFor(() => {
        expect(
          screen.getByText("User already registered")
        ).toBeInTheDocument();
      });
    });
  });

  // --- 로딩 상태 ---
  describe("Loading state", () => {
    it("disables submit button while loading", async () => {
      // signUpWithEmail은 resolve되지 않아 로딩 상태를 유지함
      mockSignUpWithEmail.mockImplementation(() => new Promise(() => {}));

      render(<SignupPage />);
      fillValidForm();

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
      });

      await waitFor(() => {
        const loadingButton = screen.getByRole("button", { name: /처리 중/i });
        expect(loadingButton).toBeDisabled();
      });
    });
  });

  // --- 소셜 회원가입 ---
  describe("Social signup", () => {
    it("calls signInWithOAuth with google when Google button is clicked", async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: "google", url: "https://accounts.google.com" },
        error: null,
      });

      render(<SignupPage />);
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

      render(<SignupPage />);
      fireEvent.click(screen.getByRole("button", { name: /kakao/i }));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith("kakao");
      });
    });
  });
});
