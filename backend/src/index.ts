import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8008 });

interface User {
  socket: WebSocket;
  room: String;
}

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

let allSocket: User[] = [];

wss.on("connection", function (socket) {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);

    if (parsedMessage.type == "create") {
      const roomId = generateRoomCode();
      allSocket.push({ socket, room: roomId });
      socket.send(
        JSON.stringify({
          type: "room-created",
          payload: { roomId },
        })
      );
    }

    if (parsedMessage.type == "join") {
      const usersInRoom = allSocket.filter(
        (u) => u.room === parsedMessage.payload.roomId
      );
      if (usersInRoom.length >= 2) {
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Room full" },
          })
        );
        return;
      }
      allSocket.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
      socket.send(
        JSON.stringify({
          type: "Success",
          payload: { message: "Joined room succesfully" },
        })
      );
    }

    if (parsedMessage.type == "chat") {
      const userRoom = allSocket.find((x) => x.socket == socket)?.room;
      allSocket.forEach((user) => {
        if (user.room == userRoom) {
          user.socket.send(
            JSON.stringify({
              type: "chat",
              payload: { message: parsedMessage.payload.message },
            })
          );
        }
      });
    }
  });
  socket.on("close", () => {
    allSocket = allSocket.filter((user) => user.socket !== socket);
    console.log("A user disconnected. Cleaned up.");
  });
});
