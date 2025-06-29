import { useEffect, useRef, useState } from "react";

interface Message {
  message: string;
  sender: "me" | "other";
}

export default function useSocket(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const pendingJoinRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const socket = new WebSocket("wss://real-time-chat-app-mev3.onrender.com");
    socketRef.current = socket;
    setHasJoined(false);
    setIsConnected(false);

    socket.onopen = () => {
      setIsConnected(true);
      pendingJoinRef.current = true;
      socket.send(JSON.stringify({ type: "join", payload: { roomId } }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          {
            message: data.payload.message,
            sender: data.payload.sender,
          },
        ]);
      }

      if (data.type === "error") {
        if (
          data.payload.message === "Invalid room code." &&
          pendingJoinRef.current
        ) {
          pendingJoinRef.current = false;
          socket.send(JSON.stringify({ type: "create", payload: { roomId } }));
        } else {
          setError(data.payload.message);
        }
      }

      if (data.type === "room-created" || data.type === "Success") {
        setHasJoined(true);
        setError("");
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setHasJoined(false);
    };

    socket.onerror = () => {
      setError("Connection error. Please try again.");
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = (msg: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to server.");
      return;
    }

    if (!hasJoined) {
      setError("Still joining the room. Try again in a second.");
      return;
    }

    socketRef.current.send(
      JSON.stringify({ type: "chat", payload: { message: msg } })
    );
  };

  const clearError = () => setError("");

  return {
    messages,
    sendMessage,
    error,
    clearError,
    isConnected,
  };
}
