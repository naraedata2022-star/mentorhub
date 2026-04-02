// @TASK P3-R3-T1 - Messages API 함수 테스트
// @SPEC docs/planning/04-database-design.md#messages

import {
  getMessages,
  sendMessage,
  markAsRead,
} from "@/lib/api/messages";
import type { Message } from "@/types/message";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockLimit = jest.fn();
const mockRange = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

const mockMessages: Message[] = [
  {
    id: "msg-1",
    chat_room_id: "room-1",
    sender_id: "user-1",
    content: "Hello!",
    is_read: true,
    created_at: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "msg-2",
    chat_room_id: "room-1",
    sender_id: "user-2",
    content: "Hi there!",
    is_read: false,
    created_at: "2026-04-01T10:01:00.000Z",
  },
  {
    id: "msg-3",
    chat_room_id: "room-1",
    sender_id: "user-1",
    content: "How are you?",
    is_read: false,
    created_at: "2026-04-01T10:02:00.000Z",
  },
];

describe("Messages API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getMessages ---
  describe("getMessages", () => {
    it("should fetch messages for a chat room ordered by created_at asc", async () => {
      mockOrder.mockResolvedValue({
        data: mockMessages,
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMessages("room-1");

      expect(mockFrom).toHaveBeenCalledWith("messages");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("chat_room_id", "room-1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: true,
      });
      expect(result.data).toEqual(mockMessages);
      expect(result.error).toBeNull();
    });

    it("should apply limit when provided", async () => {
      mockLimit.mockResolvedValue({
        data: [mockMessages[0]],
        error: null,
      });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMessages("room-1", { limit: 1 });

      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result.data).toEqual([mockMessages[0]]);
      expect(result.error).toBeNull();
    });

    it("should apply offset with range when provided", async () => {
      mockRange.mockResolvedValue({
        data: [mockMessages[1], mockMessages[2]],
        error: null,
      });
      mockLimit.mockReturnValue({ range: mockRange });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMessages("room-1", { limit: 10, offset: 1 });

      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockRange).toHaveBeenCalledWith(1, 10);
      expect(result.data).toEqual([mockMessages[1], mockMessages[2]]);
      expect(result.error).toBeNull();
    });

    it("should return empty array when no messages exist", async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getMessages("room-empty");

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

      const result = await getMessages("room-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });
  });

  // --- sendMessage ---
  describe("sendMessage", () => {
    it("should send a message and return the created message", async () => {
      const newMessage: Message = {
        id: "msg-new",
        chat_room_id: "room-1",
        sender_id: "user-1",
        content: "New message!",
        is_read: false,
        created_at: "2026-04-02T00:00:00.000Z",
      };
      mockSingle.mockResolvedValue({
        data: newMessage,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await sendMessage("room-1", "user-1", "New message!");

      expect(mockFrom).toHaveBeenCalledWith("messages");
      expect(mockInsert).toHaveBeenCalledWith({
        chat_room_id: "room-1",
        sender_id: "user-1",
        content: "New message!",
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(newMessage);
      expect(result.error).toBeNull();
    });

    it("should return error when message insert fails", async () => {
      const insertError = {
        message: "Foreign key violation",
        details: "chat_room_id not found",
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

      const result = await sendMessage(
        "nonexistent-room",
        "user-1",
        "Hello"
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual(insertError);
    });
  });

  // --- markAsRead ---
  describe("markAsRead", () => {
    it("should mark a message as read", async () => {
      const updatedMessage = { ...mockMessages[1], is_read: true };
      mockSingle.mockResolvedValue({
        data: updatedMessage,
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await markAsRead("msg-2");

      expect(mockFrom).toHaveBeenCalledWith("messages");
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(mockEq).toHaveBeenCalledWith("id", "msg-2");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data?.is_read).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should return error when message not found", async () => {
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

      const result = await markAsRead("nonexistent-msg");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });
});
