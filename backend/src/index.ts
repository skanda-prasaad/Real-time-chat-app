import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8008 });

interface User {
  socket: WebSocket;
  room: string;
  userId: string;
}

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}

// Store all connected users
let users: User[] = [];

// Get users in a specific room
function getUsersInRoom(roomId: string): User[] {
  return users.filter(user => user.room === roomId);
}

wss.on("connection", function (socket) {
  console.log("New connection established");

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);
    console.log("Received message:", parsedMessage.type);

    if (parsedMessage.type === "create") {
      const roomId = parsedMessage.payload?.roomId || generateRoomCode();
      const userId = generateUserId();

      // Check if room already exists and has users
      const existingUsers = getUsersInRoom(roomId);
      if (existingUsers.length >= 2) {
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Room full. Only 2 users allowed." },
          })
        );
        return;
      }

      // Add user to room
      const user = { socket, room: roomId, userId };
      users.push(user);

      console.log(`Room created/joined: ${roomId}, users: ${getUsersInRoom(roomId).length}`);
      socket.send(
        JSON.stringify({
          type: "room-created",
          payload: { roomId },
        })
      );
    }

    if (parsedMessage.type === "join") {
      const roomId = parsedMessage.payload.roomId;
      const usersInRoom = getUsersInRoom(roomId);

      console.log(`Attempting to join room: ${roomId}, users in room: ${usersInRoom.length}`);

      // Check if room exists (has at least one user)
      if (usersInRoom.length === 0) {
        console.log(`Room ${roomId} does not exist`);
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Invalid room code." },
          })
        );
        return;
      }

      // Check room capacity (max 2 users)
      if (usersInRoom.length >= 2) {
        console.log(`Room ${roomId} is full`);
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Room full. Only 2 users allowed." },
          })
        );
        return;
      }

      // Add user to room
      const userId = generateUserId();
      const user = { socket, room: roomId, userId };
      users.push(user);

      console.log(`User joined room: ${roomId}, total users: ${getUsersInRoom(roomId).length}`);

      socket.send(
        JSON.stringify({
          type: "Success",
          payload: { message: "Joined room successfully" },
        })
      );
    }

    if (parsedMessage.type === "chat") {
      const currentUser = users.find((x) => x.socket === socket);
      if (!currentUser) return;

      const usersInRoom = getUsersInRoom(currentUser.room);
      console.log(`Chat message in room: ${currentUser.room}, users: ${usersInRoom.length}`);

      // Send message to all users in the room
      usersInRoom.forEach((user) => {
        user.socket.send(
          JSON.stringify({
            type: "chat",
            payload: {
              message: parsedMessage.payload.message,
              sender: user.socket === socket ? "me" : "other"
            },
          })
        );
      });
    }
  });

  socket.on("close", () => {
    const userIndex = users.findIndex((user) => user.socket === socket);
    if (userIndex !== -1) {
      const user = users[userIndex];
      console.log(`User disconnected from room: ${user.room}`);
      users.splice(userIndex, 1);
      console.log(`Remaining users in room ${user.room}: ${getUsersInRoom(user.room).length}`);
    }
    console.log("A user disconnected. Cleaned up.");
  });

  socket.on("error", (error) => {
    console.log("Socket error:", error);
  });
});
