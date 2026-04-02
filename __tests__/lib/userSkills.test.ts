// @TASK P2-R1-T1 - User Skills API 함수 테스트
// @SPEC docs/planning/04-database-design.md#user_skills

import {
  getUserSkills,
  createUserSkill,
  deleteUserSkill,
  getUserSkillsByCategory,
} from "@/lib/api/userSkills";
import type { UserSkill } from "@/types/userSkill";

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

const mockSkills: UserSkill[] = [
  {
    id: "skill-1",
    user_id: "user-1",
    category_id: "cat-1",
    title: "React 기초",
    description: "React 컴포넌트 작성법을 가르칠 수 있습니다",
    created_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "skill-2",
    user_id: "user-1",
    category_id: "cat-2",
    title: "TypeScript",
    description: null,
    created_at: "2026-04-02T00:00:00Z",
  },
];

describe("User Skills API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getUserSkills ---
  describe("getUserSkills", () => {
    it("should fetch all skills for a user ordered by created_at descending", async () => {
      mockOrder.mockResolvedValue({
        data: mockSkills,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserSkills("user-1");

      expect(mockFrom).toHaveBeenCalledWith("user_skills");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(mockSkills);
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

      const result = await getUserSkills("user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return empty array when user has no skills", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserSkills("user-no-skills");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  // --- createUserSkill ---
  describe("createUserSkill", () => {
    it("should create a new skill with all fields", async () => {
      const newSkill = mockSkills[0];
      mockSingle.mockResolvedValue({
        data: newSkill,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createUserSkill("user-1", {
        category_id: "cat-1",
        title: "React 기초",
        description: "React 컴포넌트 작성법을 가르칠 수 있습니다",
      });

      expect(mockFrom).toHaveBeenCalledWith("user_skills");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        category_id: "cat-1",
        title: "React 기초",
        description: "React 컴포넌트 작성법을 가르칠 수 있습니다",
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(newSkill);
      expect(result.error).toBeNull();
    });

    it("should create a new skill without description", async () => {
      const newSkill = mockSkills[1];
      mockSingle.mockResolvedValue({
        data: newSkill,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createUserSkill("user-1", {
        category_id: "cat-2",
        title: "TypeScript",
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        category_id: "cat-2",
        title: "TypeScript",
      });
      expect(result.data).toEqual(newSkill);
      expect(result.error).toBeNull();
    });

    it("should return error when insert fails", async () => {
      const dbError = {
        message: "Foreign key violation",
        details: "",
        hint: "",
        code: "23503",
      };
      mockSingle.mockResolvedValue({
        data: null,
        error: dbError,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await createUserSkill("user-1", {
        category_id: "nonexistent-cat",
        title: "Invalid Skill",
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });
  });

  // --- deleteUserSkill ---
  describe("deleteUserSkill", () => {
    it("should delete a skill by id", async () => {
      mockEq.mockResolvedValue({
        error: null,
      });
      mockDelete.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      const result = await deleteUserSkill("skill-1");

      expect(mockFrom).toHaveBeenCalledWith("user_skills");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "skill-1");
      expect(result.error).toBeNull();
    });

    it("should return error when delete fails", async () => {
      const dbError = {
        message: "Row not found",
        details: "",
        hint: "",
        code: "PGRST116",
      };
      mockEq.mockResolvedValue({
        error: dbError,
      });
      mockDelete.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      const result = await deleteUserSkill("nonexistent-skill");

      expect(result.error).toEqual(dbError);
    });
  });

  // --- getUserSkillsByCategory ---
  describe("getUserSkillsByCategory", () => {
    it("should fetch all skills for a category ordered by created_at descending", async () => {
      const categorySkills = [mockSkills[0]];
      mockOrder.mockResolvedValue({
        data: categorySkills,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserSkillsByCategory("cat-1");

      expect(mockFrom).toHaveBeenCalledWith("user_skills");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("category_id", "cat-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result.data).toEqual(categorySkills);
      expect(result.error).toBeNull();
    });

    it("should return error when fetch fails", async () => {
      const dbError = {
        message: "Database error",
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

      const result = await getUserSkillsByCategory("cat-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return empty array when no skills exist for category", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getUserSkillsByCategory("cat-empty");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });
});
