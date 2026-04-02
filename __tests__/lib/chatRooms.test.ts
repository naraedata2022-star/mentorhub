// @TASK P3-R2-T1 - Chat Rooms API 함수 테스트
// @SPEC docs/planning/04-database-design.md#chat-rooms

import {
  getChatRoomsForUser,
  createChatRoom,
  getChatRoomById,
} from "@/lib/api/chatRooms";

// Mock Supabase 브라우저 클라이언트
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe("Chat Rooms API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getChatRoomsForUser ---
  describe("getChatRoomsForUser", () => {
    it("should fetch user participations and then rooms with details", async () => {
      const participations = [
        { chat_room_id: "room-1" },
        { chat_room_id: "room-2" },
      ];

      const rooms = [
        {
          id: "room-1",
          created_at: "2026-04-01T00:00:00.000Z",
          chat_participants: [
            {
              user_id: "user-1",
              users: { id: "user-1", name: "Alice", avatar_url: null },
            },
            {
              user_id: "user-2",
              users: {
                id: "user-2",
                name: "Bob",
                avatar_url: "https://example.com/bob.jpg",
              },
            },
          ],
          messages: [
            {
              content: "Hello!",
              created_at: "2026-04-01T10:00:00.000Z",
              sender_id: "user-2",
            },
          ],
        },
        {
          id: "room-2",
          created_at: "2026-03-31T00:00:00.000Z",
          chat_participants: [
            {
              user_id: "user-1",
              users: { id: "user-1", name: "Alice", avatar_url: null },
            },
            {
              user_id: "user-3",
              users: { id: "user-3", name: "Charlie", avatar_url: null },
            },
          ],
          messages: [],
        },
      ];

      // First call: chat_participants query
      const mockEqPart = jest.fn().mockResolvedValue({
        data: participations,
        error: null,
      });
      const mockSelectPart = jest.fn().mockReturnValue({ eq: mockEqPart });

      // Second call: chat_rooms query
      mockOrder.mockResolvedValue({ data: rooms, error: null });
      mockIn.mockReturnValue({ order: mockOrder });
      const mockSelectRooms = jest.fn().mockReturnValue({ in: mockIn });

      mockFrom
        .mockReturnValueOnce({ select: mockSelectPart })
        .mockReturnValueOnce({ select: mockSelectRooms });

      const result = await getChatRoomsForUser("user-1");

      expect(mockFrom).toHaveBeenCalledWith("chat_participants");
      expect(mockFrom).toHaveBeenCalledWith("chat_rooms");
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      // room-1: partner should be Bob
      expect(result.data?.[0].partner.name).toBe("Bob");
      expect(result.data?.[0].last_message?.content).toBe("Hello!");
      // room-2: partner should be Charlie, no last message
      expect(result.data?.[1].partner.name).toBe("Charlie");
      expect(result.data?.[1].last_message).toBeNull();
    });

    it("should return empty array when user has no chat rooms", async () => {
      const mockEqPart = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      const mockSelectPart = jest.fn().mockReturnValue({ eq: mockEqPart });
      mockFrom.mockReturnValue({ select: mockSelectPart });

      const result = await getChatRoomsForUser("user-no-rooms");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should return error when participations query fails", async () => {
      const dbError = {
        message: "Database connection failed",
        details: "",
        hint: "",
        code: "500",
      };
      const mockEqPart = jest.fn().mockResolvedValue({
        data: null,
        error: dbError,
      });
      const mockSelectPart = jest.fn().mockReturnValue({ eq: mockEqPart });
      mockFrom.mockReturnValue({ select: mockSelectPart });

      const result = await getChatRoomsForUser("user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });

    it("should return error when rooms query fails", async () => {
      const participations = [{ chat_room_id: "room-1" }];
      const dbError = {
        message: "Query failed",
        details: "",
        hint: "",
        code: "500",
      };

      const mockEqPart = jest.fn().mockResolvedValue({
        data: participations,
        error: null,
      });
      const mockSelectPart = jest.fn().mockReturnValue({ eq: mockEqPart });

      mockOrder.mockResolvedValue({ data: null, error: dbError });
      mockIn.mockReturnValue({ order: mockOrder });
      const mockSelectRooms = jest.fn().mockReturnValue({ in: mockIn });

      mockFrom
        .mockReturnValueOnce({ select: mockSelectPart })
        .mockReturnValueOnce({ select: mockSelectRooms });

      const result = await getChatRoomsForUser("user-1");

      expect(result.data).toBeNull();
      expect(result.error).toEqual(dbError);
    });
  });

  // --- createChatRoom ---
  describe("createChatRoom", () => {
    it("should create a chat room and add participants", async () => {
      const newRoom = {
        id: "room-new",
        created_at: "2026-04-02T00:00:00.000Z",
      };

      // First call: insert chat_rooms
      mockSingle.mockResolvedValue({ data: newRoom, error: null });
      mockSelect.mockReturnValue({ single: mockSingle });
      const mockInsertRoom = jest.fn().mockReturnValue({ select: mockSelect });

      // Second call: insert chat_participants
      const mockInsertParticipants = jest
        .fn()
        .mockResolvedValue({ error: null });

      mockFrom
        .mockReturnValueOnce({ insert: mockInsertRoom })
        .mockReturnValueOnce({ insert: mockInsertParticipants });

      const result = await createChatRoom(["user-1", "user-2"]);

      expect(mockFrom).toHaveBeenCalledWith("chat_rooms");
      expect(mockFrom).toHaveBeenCalledWith("chat_participants");
      expect(mockInsertParticipants).toHaveBeenCalledWith([
        { chat_room_id: "room-new", user_id: "user-1" },
        { chat_room_id: "room-new", user_id: "user-2" },
      ]);
      expect(result.data).toEqual(newRoom);
      expect(result.error).toBeNull();
    });

    it("should return error when room creation fails", async () => {
      const insertError = {
        message: "Insert failed",
        details: "",
        hint: "",
        code: "500",
      };
      mockSingle.mockResolvedValue({ data: null, error: insertError });
      mockSelect.mockReturnValue({ single: mockSingle });
      const mockInsertRoom = jest.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsertRoom });

      const result = await createChatRoom(["user-1", "user-2"]);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(insertError);
    });

    it("should return error when participant insertion fails", async () => {
      const newRoom = {
        id: "room-new",
        created_at: "2026-04-02T00:00:00.000Z",
      };
      const partError = {
        message: "Unique constraint violation",
        details: "",
        hint: "",
        code: "23505",
      };

      mockSingle.mockResolvedValue({ data: newRoom, error: null });
      mockSelect.mockReturnValue({ single: mockSingle });
      const mockInsertRoom = jest.fn().mockReturnValue({ select: mockSelect });

      const mockInsertParticipants = jest
        .fn()
        .mockResolvedValue({ error: partError });

      mockFrom
        .mockReturnValueOnce({ insert: mockInsertRoom })
        .mockReturnValueOnce({ insert: mockInsertParticipants });

      const result = await createChatRoom(["user-1", "user-2"]);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(partError);
    });
  });

  // --- getChatRoomById ---
  describe("getChatRoomById", () => {
    it("should fetch a chat room with participants", async () => {
      const roomWithParticipants = {
        id: "room-1",
        created_at: "2026-04-01T00:00:00.000Z",
        chat_participants: [
          {
            id: "part-1",
            chat_room_id: "room-1",
            user_id: "user-1",
            joined_at: "2026-04-01T00:00:00.000Z",
          },
          {
            id: "part-2",
            chat_room_id: "room-1",
            user_id: "user-2",
            joined_at: "2026-04-01T00:00:00.000Z",
          },
        ],
      };
      mockSingle.mockResolvedValue({
        data: roomWithParticipants,
        error: null,
      });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await getChatRoomById("room-1");

      expect(mockFrom).toHaveBeenCalledWith("chat_rooms");
      expect(mockSelect).toHaveBeenCalledWith(
        "*, chat_participants(id, chat_room_id, user_id, joined_at)"
      );
      expect(mockEq).toHaveBeenCalledWith("id", "room-1");
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual({
        id: "room-1",
        created_at: "2026-04-01T00:00:00.000Z",
      });
      expect(result.participants).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it("should return error when room not found", async () => {
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

      const result = await getChatRoomById("nonexistent-id");

      expect(result.data).toBeNull();
      expect(result.participants).toBeNull();
      expect(result.error).toEqual(notFoundError);
    });
  });
});
