import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8008 });

interface User {
  socket: WebSocket;
  room: string;
  userId: string;
}

let users: User[] = [];

function generateRoomCode(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getUsersInRoom(roomId: string): User[] {
  return users.filter((user) => user.room === roomId);
}

function sendToSocket(socket: WebSocket, type: string, payload: any) {
  socket.send(JSON.stringify({ type, payload }));
}

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(data.toString());
    } catch {
      return;
    }

    const { type, payload } = parsedMessage;

    switch (type) {
      case "create": {
        const roomId = payload?.roomId || generateRoomCode();
        const userId = generateUserId();
        const existingUsers = getUsersInRoom(roomId);

        if (existingUsers.length >= 2) {
          sendToSocket(socket, "error", {
            message: "Room full. Only 2 users allowed.",
          });
          return;
        }

        users.push({ socket, room: roomId, userId });
        sendToSocket(socket, "room-created", { roomId });
        break;
      }

      case "join": {
        const roomId = payload?.roomId;
        if (!roomId) {
          sendToSocket(socket, "error", {
            message: "Room ID required to join.",
          });
          return;
        }

        const usersInRoom = getUsersInRoom(roomId);

        if (usersInRoom.length === 0) {
          sendToSocket(socket, "error", { message: "Invalid room code." });
          return;
        }

        if (usersInRoom.length >= 2) {
          sendToSocket(socket, "error", {
            message: "Room full. Only 2 users allowed.",
          });
          return;
        }

        const userId = generateUserId();
        users.push({ socket, room: roomId, userId });
        sendToSocket(socket, "joined", {
          message: "Joined room successfully",
          roomId,
        });
        break;
      }

      case "chat": {
        const currentUser = users.find((u) => u.socket === socket);
        if (!currentUser) return;

        const usersInRoom = getUsersInRoom(currentUser.room);
        usersInRoom.forEach((user) => {
          const isSelf = user.socket === socket;
          sendToSocket(user.socket, "chat", {
            message: payload?.message,
            sender: isSelf ? "me" : "other",
          });
        });
        break;
      }

      default:
        sendToSocket(socket, "error", { message: "Unknown message type." });
        break;
    }
  });

  socket.on("close", () => {
    const userIndex = users.findIndex((user) => user.socket === socket);
    if (userIndex !== -1) users.splice(userIndex, 1);
  });

  socket.on("error", () => {});
});
