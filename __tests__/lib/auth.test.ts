// @TASK P1-R1-T1 - Supabase Auth 헬퍼 함수 테스트
// @SPEC docs/planning/02-trd.md#인증-API

import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  signInWithOAuth,
  getSession,
  getUser,
} from "@/lib/supabase/auth";

// Mock Supabase 브라우저 클라이언트
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockGetSession = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      signInWithOAuth: mockSignInWithOAuth,
      getSession: mockGetSession,
      getUser: mockGetUser,
    },
  }),
}));

describe("Auth Helper Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- signInWithEmail ---
  describe("signInWithEmail", () => {
    it("should call supabase signInWithPassword with email and password", async () => {
      const mockResponse = {
        data: {
          user: { id: "user-1", email: "test@example.com" },
          session: { access_token: "token-123" },
        },
        error: null,
      };
      mockSignInWithPassword.mockResolvedValue(mockResponse);

      const result = await signInWithEmail("test@example.com", "password123");

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it("should return error when login fails", async () => {
      const mockResponse = {
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      };
      mockSignInWithPassword.mockResolvedValue(mockResponse);

      const result = await signInWithEmail("wrong@example.com", "wrong");

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Invalid login credentials");
    });
  });

  // --- signUpWithEmail ---
  describe("signUpWithEmail", () => {
    it("should call supabase signUp with email, password, and name metadata", async () => {
      const mockResponse = {
        data: {
          user: { id: "user-2", email: "new@example.com" },
          session: null,
        },
        error: null,
      };
      mockSignUp.mockResolvedValue(mockResponse);

      const result = await signUpWithEmail(
        "new@example.com",
        "password123",
        "Test User"
      );

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        options: {
          data: {
            name: "Test User",
          },
        },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it("should return error when signup fails (e.g., email already registered)", async () => {
      const mockResponse = {
        data: { user: null, session: null },
        error: { message: "User already registered" },
      };
      mockSignUp.mockResolvedValue(mockResponse);

      const result = await signUpWithEmail(
        "existing@example.com",
        "password123",
        "Existing User"
      );

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("User already registered");
    });
  });

  // --- signOut ---
  describe("signOut", () => {
    it("should call supabase signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it("should return error when signOut fails", async () => {
      mockSignOut.mockResolvedValue({
        error: { message: "Session not found" },
      });

      const result = await signOut();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Session not found");
    });
  });

  // --- signInWithOAuth ---
  describe("signInWithOAuth", () => {
    it("should call supabase signInWithOAuth with google provider", async () => {
      const mockResponse = {
        data: { provider: "google", url: "https://accounts.google.com/..." },
        error: null,
      };
      mockSignInWithOAuth.mockResolvedValue(mockResponse);

      const result = await signInWithOAuth("google");

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it("should call supabase signInWithOAuth with kakao provider", async () => {
      const mockResponse = {
        data: { provider: "kakao", url: "https://kauth.kakao.com/..." },
        error: null,
      };
      mockSignInWithOAuth.mockResolvedValue(mockResponse);

      const result = await signInWithOAuth("kakao");

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "kakao",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  // --- getSession ---
  describe("getSession", () => {
    it("should return current session", async () => {
      const mockResponse = {
        data: {
          session: { access_token: "token-123", user: { id: "user-1" } },
        },
        error: null,
      };
      mockGetSession.mockResolvedValue(mockResponse);

      const result = await getSession();

      expect(mockGetSession).toHaveBeenCalled();
      expect(result.data?.session).toBeDefined();
    });

    it("should return null session when not authenticated", async () => {
      const mockResponse = {
        data: { session: null },
        error: null,
      };
      mockGetSession.mockResolvedValue(mockResponse);

      const result = await getSession();

      expect(result.data?.session).toBeNull();
    });
  });

  // --- getUser ---
  describe("getUser", () => {
    it("should return current user", async () => {
      const mockResponse = {
        data: { user: { id: "user-1", email: "test@example.com" } },
        error: null,
      };
      mockGetUser.mockResolvedValue(mockResponse);

      const result = await getUser();

      expect(mockGetUser).toHaveBeenCalled();
      expect(result.data?.user?.id).toBe("user-1");
    });

    it("should return null user when not authenticated", async () => {
      const mockResponse = {
        data: { user: null },
        error: null,
      };
      mockGetUser.mockResolvedValue(mockResponse);

      const result = await getUser();

      expect(result.data?.user).toBeNull();
    });
  });
});
