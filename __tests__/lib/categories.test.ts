// @TASK P1-R3-T1 - Categories API 함수 테스트
// @SPEC docs/planning/04-database-design.md#categories

import { getCategories, getCategoryById } from "@/lib/api/categories";
import type { Category } from "@/types/category";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const mockCategories: Category[] = [
  { id: "cat-1", name: "프로그래밍", icon: "code", sort_order: 1 },
  { id: "cat-2", name: "디자인", icon: "palette", sort_order: 2 },
  { id: "cat-3", name: "음악", icon: null, sort_order: 3 },
];

describe("Categories API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getCategories ---
  describe("getCategories", () => {
    it("should fetch all categories ordered by sort_order ascending", async () => {
      mockOrder.mockResolvedValue({
        data: mockCategories,
        error: null,
      });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getCategories();

      expect(mockFrom).toHaveBeenCalledWith("categories");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("sort_order", { ascending: true });
      expect(result.data).toEqual(mockCategories);
      expect(result.error).toBeNull();
    });

    it("should return error when fetch fails", async () => {
      const dbError = { message: "Database connection failed", details: "", hint: "", code: "500" };
      mockOrder.mockResolvedValue({
        data: null,
        error: dbError,
      });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getCategories();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return empty array when no categories exist", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getCategories();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  // --- getCategoryById ---
  describe("getCategoryById", () => {
    it("should fetch a single category by id", async () => {
      const singleCategory = mockCategories[0];
      mockSingle.mockResolvedValue({
        data: singleCategory,
        error: null,
      });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getCategoryById("cat-1");

      expect(mockFrom).toHaveBeenCalledWith("categories");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "cat-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(singleCategory);
      expect(result.error).toBeNull();
    });

    it("should return error when category not found", async () => {
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

      const result = await getCategoryById("nonexistent-id");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });
});
