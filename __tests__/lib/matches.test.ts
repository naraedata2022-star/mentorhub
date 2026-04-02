// @TASK P3-R1-T1 - Matches API 함수 테스트
// @SPEC docs/planning/04-database-design.md#matches

import {
  getMatchesForUser,
  updateMatchStatus,
  getMatchById,
} from "@/lib/api/matches";
import type { Match } from "@/types/match";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();
const mockOr = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const mockMatches: Match[] = [
  {
    id: "match-1",
    user_a_id: "user-1",
    user_b_id: "user-2",
    score: 0.85,
    status: "pending",
    created_at: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "match-2",
    user_a_id: "user-3",
    user_b_id: "user-1",
    score: 0.72,
    status: "accepted",
    created_at: "2026-03-31T00:00:00.000Z",
  },
];

const mockMatchesWithJoin = [
  {
    ...mockMatches[0],
    user_a: {
      id: "user-1",
      name: "Alice",
      avatar_url: null,
      bio: "Developer",
      region: "Seoul",
    },
    user_b: {
      id: "user-2",
      name: "Bob",
      avatar_url: "https://example.com/bob.jpg",
      bio: "Designer",
      region: "Busan",
    },
  },
  {
    ...mockMatches[1],
    user_a: {
      id: "user-3",
      name: "Charlie",
      avatar_url: null,
      bio: "PM",
      region: "Daejeon",
    },
    user_b: {
      id: "user-1",
      name: "Alice",
      avatar_url: null,
      bio: "Developer",
      region: "Seoul",
    },
  },
];

describe("Matches API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getMatchesForUser ---
  describe("getMatchesForUser", () => {
    it("should fetch all matches for a user and map partner info", async () => {
      mockOrder.mockResolvedValue({
        data: mockMatchesWithJoin,
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMatchesForUser("user-1");

      expect(mockFrom).toHaveBeenCalledWith("matches");
      expect(mockSelect).toHaveBeenCalledWith(
        "*, user_a:users!matches_user_a_id_fkey(id, name, avatar_url, bio, region), user_b:users!matches_user_b_id_fkey(id, name, avatar_url, bio, region)"
      );
      expect(mockOr).toHaveBeenCalledWith(
        "user_a_id.eq.user-1,user_b_id.eq.user-1"
      );
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
    });

    it("should set partner to user_b when user is user_a", async () => {
      mockOrder.mockResolvedValue({
        data: [mockMatchesWithJoin[0]],
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMatchesForUser("user-1");

      expect(result.data?.[0].partner.name).toBe("Bob");
      expect(result.data?.[0].partner.id).toBe("user-2");
    });

    it("should set partner to user_a when user is user_b", async () => {
      mockOrder.mockResolvedValue({
        data: [mockMatchesWithJoin[1]],
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMatchesForUser("user-1");

      expect(result.data?.[0].partner.name).toBe("Charlie");
      expect(result.data?.[0].partner.id).toBe("user-3");
    });

    it("should return empty array when no matches exist", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMatchesForUser("user-no-matches");

      expect(result.data).toEqual([]);
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
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMatchesForUser("user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });
  });

  // --- updateMatchStatus ---
  describe("updateMatchStatus", () => {
    it("should update match status to accepted", async () => {
      const updatedMatch = { ...mockMatches[0], status: "accepted" as const };
      mockSingle.mockResolvedValue({
        data: updatedMatch,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateMatchStatus("match-1", "accepted");

      expect(mockFrom).toHaveBeenCalledWith("matches");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "accepted" });
      expect(mockEq).toHaveBeenCalledWith("id", "match-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedMatch);
      expect(result.error).toBeNull();
    });

    it("should update match status to dismissed", async () => {
      const updatedMatch = { ...mockMatches[0], status: "dismissed" as const };
      mockSingle.mockResolvedValue({
        data: updatedMatch,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateMatchStatus("match-1", "dismissed");

      expect(mockUpdate).toHaveBeenCalledWith({ status: "dismissed" });
      expect(result.data?.status).toBe("dismissed");
      expect(result.error).toBeNull();
    });

    it("should return error when match not found", async () => {
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
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateMatchStatus("nonexistent-id", "accepted");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });

  // --- getMatchById ---
  describe("getMatchById", () => {
    it("should fetch a single match by id", async () => {
      mockSingle.mockResolvedValue({
        data: mockMatches[0],
        error: null,
      });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMatchById("match-1");

      expect(mockFrom).toHaveBeenCalledWith("matches");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "match-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockMatches[0]);
      expect(result.error).toBeNull();
    });

    it("should return error when match not found", async () => {
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

      const result = await getMatchById("nonexistent-id");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });
});
