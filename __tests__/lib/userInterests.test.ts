// @TASK P2-R2-T1 - User Interests API 함수 테스트
// @SPEC docs/planning/04-database-design.md#user_interests

import {
  getUserInterests,
  createUserInterest,
  deleteUserInterest,
  getUserInterestsByCategory,
} from "@/lib/api/userInterests";
import type { UserInterest } from "@/types/userInterest";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const mockInterests: UserInterest[] = [
  {
    id: "interest-1",
    user_id: "user-1",
    category_id: "cat-1",
    title: "React 배우기",
    description: "React 19 신기능 학습",
    created_at: "2026-04-02T10:00:00Z",
  },
  {
    id: "interest-2",
    user_id: "user-1",
    category_id: "cat-2",
    title: "피아노 연습",
    description: null,
    created_at: "2026-04-01T08:00:00Z",
  },
  {
    id: "interest-3",
    user_id: "user-2",
    category_id: "cat-1",
    title: "TypeScript 심화",
    description: "제네릭, 유틸리티 타입 마스터",
    created_at: "2026-04-01T12:00:00Z",
  },
];

describe("UserInterests API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getUserInterests ---
  describe("getUserInterests", () => {
    it("should fetch all interests for a user ordered by created_at descending", async () => {
      const userInterests = mockInterests.filter((i) => i.user_id === "user-1");
      mockOrder.mockResolvedValue({
        data: userInterests,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserInterests("user-1");

      expect(mockFrom).toHaveBeenCalledWith("user_interests");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(userInterests);
      expect(result.error).toBeNull();
    });

    it("should return error when fetch fails", async () => {
      const dbError = {
        message: "Database connection failed",
        details: "",
        hint: "",
        code: "500",
      };
      mockOrder.mockResolvedValue({
        data: null,
        error: dbError,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserInterests("user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return empty array when user has no interests", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserInterests("user-no-interests");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  // --- createUserInterest ---
  describe("createUserInterest", () => {
    it("should create a new interest with required fields", async () => {
      const newInterest = mockInterests[0];
      mockSingle.mockResolvedValue({
        data: newInterest,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createUserInterest("user-1", {
        category_id: "cat-1",
        title: "React 배우기",
      });

      expect(mockFrom).toHaveBeenCalledWith("user_interests");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        category_id: "cat-1",
        title: "React 배우기",
      });
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(newInterest);
      expect(result.error).toBeNull();
    });

    it("should create a new interest with optional description", async () => {
      const newInterest = mockInterests[0];
      mockSingle.mockResolvedValue({
        data: newInterest,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createUserInterest("user-1", {
        category_id: "cat-1",
        title: "React 배우기",
        description: "React 19 신기능 학습",
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        category_id: "cat-1",
        title: "React 배우기",
        description: "React 19 신기능 학습",
      });
      expect(result.data).toEqual(newInterest);
      expect(result.error).toBeNull();
    });

    it("should return error when creation fails", async () => {
      const insertError = {
        message: "foreign key violation",
        details: "",
        hint: "",
        code: "23503",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: insertError,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createUserInterest("user-1", {
        category_id: "nonexistent-cat",
        title: "Test",
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(insertError);
    });
  });

  // --- deleteUserInterest ---
  describe("deleteUserInterest", () => {
    it("should delete an interest by id", async () => {
      mockEq.mockResolvedValue({
        error: null,
      });
      mockDelete.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      const result = await deleteUserInterest("interest-1");

      expect(mockFrom).toHaveBeenCalledWith("user_interests");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "interest-1");
      expect(result.error).toBeNull();
    });

    it("should return error when delete fails", async () => {
      const deleteError = {
        message: "Row not found",
        details: "",
        hint: "",
        code: "PGRST116",
      };
      mockEq.mockResolvedValue({
        error: deleteError,
      });
      mockDelete.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      const result = await deleteUserInterest("nonexistent-id");

      expect(result.error).toEqual(deleteError);
    });
  });

  // --- getUserInterestsByCategory ---
  describe("getUserInterestsByCategory", () => {
    it("should fetch interests by category ordered by created_at descending", async () => {
      const catInterests = mockInterests.filter(
        (i) => i.category_id === "cat-1"
      );
      mockOrder.mockResolvedValue({
        data: catInterests,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserInterestsByCategory("cat-1");

      expect(mockFrom).toHaveBeenCalledWith("user_interests");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("category_id", "cat-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(catInterests);
      expect(result.error).toBeNull();
    });

    it("should return error when fetch by category fails", async () => {
      const dbError = {
        message: "Database connection failed",
        details: "",
        hint: "",
        code: "500",
      };
      mockOrder.mockResolvedValue({
        data: null,
        error: dbError,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserInterestsByCategory("cat-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return empty array when no interests in category", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserInterestsByCategory("cat-empty");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });
});
