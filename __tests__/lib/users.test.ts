// @TASK P1-R2-T1 - Users API 함수 테스트
// @SPEC docs/planning/04-database-design.md#users

import {
  getProfile,
  updateProfile,
  createProfile,
  uploadAvatar,
} from "@/lib/api/users";
import type { UserProfile } from "@/types/user";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();
const mockInsert = jest.fn();
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockFrom = jest.fn();
const mockStorageFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  }),
}));

const mockUser: UserProfile = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  avatar_url: null,
  bio: "Hello world",
  region: "Seoul",
  latitude: 37.5665,
  longitude: 126.978,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getProfile ---
  describe("getProfile", () => {
    it("should fetch a user profile by id", async () => {
      mockSingle.mockResolvedValue({
        data: mockUser,
        error: null,
      });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getProfile("user-1");

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "user-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should return error when user not found", async () => {
      const notFoundError = {
        message: "Row not found",
        details: "",
        hint: "",
        code: "PGRST116",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: notFoundError,
      });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getProfile("nonexistent-id");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });

  // --- updateProfile ---
  describe("updateProfile", () => {
    it("should update profile with allowed fields only", async () => {
      const updatedUser = { ...mockUser, name: "Updated Name", bio: "New bio" };
      mockSingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateProfile("user-1", {
        name: "Updated Name",
        bio: "New bio",
      });

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Updated Name",
        bio: "New bio",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "user-1");
      expect(result.data).toEqual(updatedUser);
      expect(result.error).toBeNull();
    });

    it("should return error when update fails", async () => {
      const updateError = {
        message: "Permission denied",
        details: "",
        hint: "",
        code: "42501",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: updateError,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateProfile("user-1", { name: "New Name" });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(updateError);
    });
  });

  // --- createProfile ---
  describe("createProfile", () => {
    it("should create a new user profile with required fields", async () => {
      const newUser = { ...mockUser, id: "user-2" };
      mockSingle.mockResolvedValue({
        data: newUser,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createProfile("user-2", {
        email: "new@example.com",
        name: "New User",
      });

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockInsert).toHaveBeenCalledWith({
        id: "user-2",
        email: "new@example.com",
        name: "New User",
      });
      expect(result.data).toEqual(newUser);
      expect(result.error).toBeNull();
    });

    it("should create profile with optional fields", async () => {
      const newUser = { ...mockUser, id: "user-3", bio: "My bio" };
      mockSingle.mockResolvedValue({
        data: newUser,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createProfile("user-3", {
        email: "another@example.com",
        name: "Another User",
        bio: "My bio",
        region: "Busan",
      });

      expect(mockInsert).toHaveBeenCalledWith({
        id: "user-3",
        email: "another@example.com",
        name: "Another User",
        bio: "My bio",
        region: "Busan",
      });
      expect(result.data).toEqual(newUser);
      expect(result.error).toBeNull();
    });

    it("should return error when profile already exists", async () => {
      const duplicateError = {
        message: "duplicate key value violates unique constraint",
        details: "",
        hint: "",
        code: "23505",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: duplicateError,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createProfile("user-1", {
        email: "test@example.com",
        name: "Test User",
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(duplicateError);
    });
  });

  // --- uploadAvatar ---
  describe("uploadAvatar", () => {
    it("should upload avatar and return public URL", async () => {
      const mockFile = new File(["avatar"], "avatar.png", {
        type: "image/png",
      });

      mockUpload.mockResolvedValue({
        data: { path: "avatars/user-1/avatar.png" },
        error: null,
      });
      mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl: "https://storage.supabase.co/avatars/user-1/avatar.png",
        },
      });
      mockStorageFrom.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const result = await uploadAvatar("user-1", mockFile);

      expect(mockStorageFrom).toHaveBeenCalledWith("avatars");
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining("user-1/"),
        mockFile,
        expect.objectContaining({
          cacheControl: "3600",
          upsert: true,
        })
      );
      expect(result.data).toBeDefined();
      expect(result.data?.publicUrl).toContain("user-1");
      expect(result.error).toBeNull();
    });

    it("should return error when upload fails", async () => {
      const mockFile = new File(["avatar"], "avatar.png", {
        type: "image/png",
      });
      const uploadError = {
        message: "File too large",
        name: "StorageApiError",
        status: 413,
      };

      mockUpload.mockResolvedValue({
        data: null,
        error: uploadError,
      });
      mockStorageFrom.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const result = await uploadAvatar("user-1", mockFile);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
