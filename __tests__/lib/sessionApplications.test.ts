// @TASK P2-R4-T1 - Session Applications API 함수 테스트
// @SPEC docs/planning/04-database-design.md#session-applications

import {
  applyToSession,
  getApplicationsBySession,
  getApplicationsByUser,
  updateApplicationStatus,
} from "@/lib/api/sessionApplications";
import type {
  SessionApplication,
  SessionApplicationWithApplicant,
  SessionApplicationWithSession,
} from "@/types/sessionApplication";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const mockApplications: SessionApplication[] = [
  {
    id: "app-1",
    session_id: "session-1",
    applicant_id: "user-1",
    status: "pending",
    created_at: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "app-2",
    session_id: "session-1",
    applicant_id: "user-2",
    status: "accepted",
    created_at: "2026-03-31T00:00:00.000Z",
  },
];

const mockApplicationsWithApplicant: SessionApplicationWithApplicant[] = [
  {
    ...mockApplications[0],
    applicant: {
      id: "user-1",
      name: "김신청",
      avatar_url: "https://example.com/avatar1.jpg",
    },
  },
  {
    ...mockApplications[1],
    applicant: {
      id: "user-2",
      name: "박멘티",
      avatar_url: null,
    },
  },
];

const mockApplicationsWithSession: SessionApplicationWithSession[] = [
  {
    ...mockApplications[0],
    session: {
      id: "session-1",
      title: "React 기초 멘토링",
      status: "active",
    },
  },
];

describe("Session Applications API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- applyToSession ---
  describe("applyToSession", () => {
    it("should create a new application with session_id and applicant_id", async () => {
      const newApplication = mockApplications[0];
      mockSingle.mockResolvedValue({
        data: newApplication,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await applyToSession("session-1", "user-1");

      expect(mockFrom).toHaveBeenCalledWith("session_applications");
      expect(mockInsert).toHaveBeenCalledWith({
        session_id: "session-1",
        applicant_id: "user-1",
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(newApplication);
      expect(result.data?.status).toBe("pending");
      expect(result.error).toBeNull();
    });

    it("should return error when session does not exist (FK violation)", async () => {
      const fkError = {
        message: "Foreign key violation",
        details: "session_id not found in mentoring_sessions",
        hint: "",
        code: "23503",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: fkError,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await applyToSession("nonexistent-session", "user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(fkError);
    });

    it("should return error when applicant does not exist (FK violation)", async () => {
      const fkError = {
        message: "Foreign key violation",
        details: "applicant_id not found in users",
        hint: "",
        code: "23503",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: fkError,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await applyToSession("session-1", "nonexistent-user");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(fkError);
    });
  });

  // --- getApplicationsBySession ---
  describe("getApplicationsBySession", () => {
    it("should fetch applications for a session with applicant info", async () => {
      mockOrder.mockResolvedValue({
        data: mockApplicationsWithApplicant,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplicationsBySession("session-1");

      expect(mockFrom).toHaveBeenCalledWith("session_applications");
      expect(mockSelect).toHaveBeenCalledWith(
        "*, applicant:users(id, name, avatar_url)"
      );
      expect(mockEq).toHaveBeenCalledWith("session_id", "session-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(mockApplicationsWithApplicant);
      expect(result.data?.[0].applicant.name).toBe("김신청");
      expect(result.error).toBeNull();
    });

    it("should return empty array when no applications exist for session", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplicationsBySession("session-no-apps");

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
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplicationsBySession("session-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });
  });

  // --- getApplicationsByUser ---
  describe("getApplicationsByUser", () => {
    it("should fetch applications for a user with session info", async () => {
      mockOrder.mockResolvedValue({
        data: mockApplicationsWithSession,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplicationsByUser("user-1");

      expect(mockFrom).toHaveBeenCalledWith("session_applications");
      expect(mockSelect).toHaveBeenCalledWith(
        "*, session:mentoring_sessions(id, title, status)"
      );
      expect(mockEq).toHaveBeenCalledWith("applicant_id", "user-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(mockApplicationsWithSession);
      expect(result.data?.[0].session.title).toBe("React 기초 멘토링");
      expect(result.error).toBeNull();
    });

    it("should return empty array when user has no applications", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplicationsByUser("user-no-apps");

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
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getApplicationsByUser("user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });
  });

  // --- updateApplicationStatus ---
  describe("updateApplicationStatus", () => {
    it("should update application status to accepted", async () => {
      const updatedApplication = {
        ...mockApplications[0],
        status: "accepted" as const,
      };
      mockSingle.mockResolvedValue({
        data: updatedApplication,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateApplicationStatus("app-1", "accepted");

      expect(mockFrom).toHaveBeenCalledWith("session_applications");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "accepted" });
      expect(mockEq).toHaveBeenCalledWith("id", "app-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedApplication);
      expect(result.data?.status).toBe("accepted");
      expect(result.error).toBeNull();
    });

    it("should update application status to rejected", async () => {
      const rejectedApplication = {
        ...mockApplications[0],
        status: "rejected" as const,
      };
      mockSingle.mockResolvedValue({
        data: rejectedApplication,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateApplicationStatus("app-1", "rejected");

      expect(mockUpdate).toHaveBeenCalledWith({ status: "rejected" });
      expect(result.data?.status).toBe("rejected");
      expect(result.error).toBeNull();
    });

    it("should return error when application does not exist", async () => {
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

      const result = await updateApplicationStatus(
        "nonexistent-id",
        "accepted"
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });
});
