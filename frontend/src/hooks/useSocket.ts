import { useEffect, useRef, useState } from "react";

interface Message {
  message: string;
  sender: "me" | "other";
}

export default function useSocket(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8008");
    socketRef.current = socket;

    socket.onopen = () => {
      if (roomId) {
        socket.send(JSON.stringify({ type: "join", payload: { roomId } }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          { message: data.payload.message, sender: data.payload.sender },
        ]);
      }
      if (data.type === "error") {
        setError(data.payload.message);
      }
      if (data.type === "room-created") {
        setRoomCode(data.payload.roomId);
      }
    };

    return () => socket.close();
  }, [roomId]);

  const sendMessage = (msg: string) => {
    socketRef.current?.send(
      JSON.stringify({ type: "chat", payload: { message: msg } })
    );
    setMessages((prev) => [...prev, { message: msg, sender: "me" }]);
  };

  const createRoom = () => {
    socketRef.current?.send(JSON.stringify({ type: "create" }));
  };

  return { messages, sendMessage, createRoom, roomCode, error };
}
