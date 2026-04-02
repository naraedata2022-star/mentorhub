// @TASK P2-R3-T1 - Mentoring Sessions API 함수 테스트
// @SPEC docs/planning/04-database-design.md#mentoring-sessions

import {
  getMentoringSessions,
  getSessionById,
  createSession,
  updateSessionStatus,
  getSessionsByMentor,
  searchSessions,
} from "@/lib/api/mentoringSessions";
import type { MentoringSession } from "@/types/mentoringSession";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockOr = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const mockSessions: MentoringSession[] = [
  {
    id: "session-1",
    mentor_id: "mentor-1",
    category_id: "cat-1",
    title: "React 기초 멘토링",
    description: "React를 처음 배우는 분을 위한 세션",
    location: "서울 강남",
    schedule: "매주 토요일 오후 2시",
    status: "active",
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "session-2",
    mentor_id: "mentor-2",
    category_id: "cat-2",
    title: "디자인 시스템 구축",
    description: null,
    location: null,
    schedule: null,
    status: "closed",
    created_at: "2026-03-31T00:00:00.000Z",
    updated_at: "2026-03-31T00:00:00.000Z",
  },
];

const mockSessionWithMentor = {
  ...mockSessions[0],
  mentor: {
    id: "mentor-1",
    name: "김멘토",
    avatar_url: "https://example.com/avatar.jpg",
    region: "서울",
  },
};

describe("Mentoring Sessions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getMentoringSessions ---
  describe("getMentoringSessions", () => {
    it("should fetch all sessions ordered by created_at desc", async () => {
      mockOrder.mockResolvedValue({
        data: mockSessions,
        error: null,
      });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMentoringSessions();

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(mockSessions);
      expect(result.error).toBeNull();
    });

    it("should filter by categoryId when provided", async () => {
      const filteredSessions = [mockSessions[0]];
      mockOrder.mockResolvedValue({
        data: filteredSessions,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq });
      // After .order(), .eq() is called on the result
      mockOrder.mockReturnValue({ eq: mockEq });
      // Reset: the chain is select -> order -> eq
      mockSelect.mockReturnValue({
        order: jest.fn().mockReturnValue({
          eq: mockEq,
        }),
      });
      mockEq.mockResolvedValue({
        data: filteredSessions,
        error: null,
      });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMentoringSessions({ categoryId: "cat-1" });

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockEq).toHaveBeenCalledWith("category_id", "cat-1");
      expect(result.data).toEqual(filteredSessions);
      expect(result.error).toBeNull();
    });

    it("should filter by status when provided", async () => {
      const activeSessions = [mockSessions[0]];
      mockEq.mockResolvedValue({
        data: activeSessions,
        error: null,
      });
      mockSelect.mockReturnValue({
        order: jest.fn().mockReturnValue({
          eq: mockEq,
        }),
      });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMentoringSessions({ status: "active" });

      expect(mockEq).toHaveBeenCalledWith("status", "active");
      expect(result.data).toEqual(activeSessions);
      expect(result.error).toBeNull();
    });

    it("should filter by both categoryId and status", async () => {
      const mockEqStatus = jest.fn();
      mockEqStatus.mockResolvedValue({
        data: [mockSessions[0]],
        error: null,
      });
      mockEq.mockReturnValue({ eq: mockEqStatus });
      mockSelect.mockReturnValue({
        order: jest.fn().mockReturnValue({
          eq: mockEq,
        }),
      });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMentoringSessions({
        categoryId: "cat-1",
        status: "active",
      });

      expect(mockEq).toHaveBeenCalledWith("category_id", "cat-1");
      expect(mockEqStatus).toHaveBeenCalledWith("status", "active");
      expect(result.data).toEqual([mockSessions[0]]);
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
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMentoringSessions();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return empty array when no sessions exist", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMentoringSessions();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  // --- getSessionById ---
  describe("getSessionById", () => {
    it("should fetch a single session with mentor info", async () => {
      mockSingle.mockResolvedValue({
        data: mockSessionWithMentor,
        error: null,
      });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getSessionById("session-1");

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockSelect).toHaveBeenCalledWith(
        "*, mentor:users(id, name, avatar_url, region)"
      );
      expect(mockEq).toHaveBeenCalledWith("id", "session-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockSessionWithMentor);
      expect(result.data?.mentor.name).toBe("김멘토");
      expect(result.error).toBeNull();
    });

    it("should return error when session not found", async () => {
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

      const result = await getSessionById("nonexistent-id");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });

  // --- createSession ---
  describe("createSession", () => {
    it("should create a new session with mentor_id and data", async () => {
      const newSession = mockSessions[0];
      mockSingle.mockResolvedValue({
        data: newSession,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const createData = {
        category_id: "cat-1",
        title: "React 기초 멘토링",
        description: "React를 처음 배우는 분을 위한 세션",
        location: "서울 강남",
        schedule: "매주 토요일 오후 2시",
      };

      const result = await createSession("mentor-1", createData);

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockInsert).toHaveBeenCalledWith({
        mentor_id: "mentor-1",
        ...createData,
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(newSession);
      expect(result.error).toBeNull();
    });

    it("should create a session with only required fields", async () => {
      const minimalSession = {
        ...mockSessions[0],
        description: null,
        location: null,
        schedule: null,
      };
      mockSingle.mockResolvedValue({
        data: minimalSession,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const createData = {
        category_id: "cat-1",
        title: "React 기초 멘토링",
      };

      const result = await createSession("mentor-1", createData);

      expect(mockInsert).toHaveBeenCalledWith({
        mentor_id: "mentor-1",
        category_id: "cat-1",
        title: "React 기초 멘토링",
      });
      expect(result.data).toEqual(minimalSession);
      expect(result.error).toBeNull();
    });

    it("should return error when insert fails", async () => {
      const insertError = {
        message: "Foreign key violation",
        details: "mentor_id not found",
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

      const result = await createSession("invalid-mentor", {
        category_id: "cat-1",
        title: "Test",
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(insertError);
    });
  });

  // --- updateSessionStatus ---
  describe("updateSessionStatus", () => {
    it("should update session status", async () => {
      const updatedSession = { ...mockSessions[0], status: "closed" as const };
      mockSingle.mockResolvedValue({
        data: updatedSession,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateSessionStatus("session-1", "closed");

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockUpdate).toHaveBeenCalledWith({
        status: "closed",
        updated_at: expect.any(String),
      });
      expect(mockEq).toHaveBeenCalledWith("id", "session-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedSession);
      expect(result.error).toBeNull();
    });

    it("should return error when session does not exist", async () => {
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

      const result = await updateSessionStatus("nonexistent-id", "completed");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });

  // --- getSessionsByMentor ---
  describe("getSessionsByMentor", () => {
    it("should fetch all sessions for a given mentor", async () => {
      const mentorSessions = [mockSessions[0]];
      mockOrder.mockResolvedValue({
        data: mentorSessions,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getSessionsByMentor("mentor-1");

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("mentor_id", "mentor-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(mentorSessions);
      expect(result.error).toBeNull();
    });

    it("should return empty array when mentor has no sessions", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getSessionsByMentor("mentor-no-sessions");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  // --- searchSessions ---
  describe("searchSessions", () => {
    it("should search sessions by title or description using ilike", async () => {
      const searchResults = [mockSessions[0]];
      mockOrder.mockResolvedValue({
        data: searchResults,
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await searchSessions("React");

      expect(mockFrom).toHaveBeenCalledWith("mentoring_sessions");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOr).toHaveBeenCalledWith(
        "title.ilike.%React%,description.ilike.%React%"
      );
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(searchResults);
      expect(result.error).toBeNull();
    });

    it("should return empty array when no sessions match", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await searchSessions("존재하지않는검색어");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should handle search with special characters", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockOr.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ or: mockOr });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await searchSessions("C++");

      expect(mockOr).toHaveBeenCalledWith(
        "title.ilike.%C++%,description.ilike.%C++%"
      );
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });
});
