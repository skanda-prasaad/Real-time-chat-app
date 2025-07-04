import { useEffect, useRef, useState } from "react";

interface Message {
  message: string;
  sender: "me" | "other";
}

export default function useSocket(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const hasTriedCreateRef = useRef(false);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket("wss://real-time-chat-app-mev3.onrender.com"); // change this to your deployed backend ws URL
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setIsJoined(false);
      hasTriedCreateRef.current = false;

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
        if (
          data.payload.message === "Invalid room code." &&
          !hasTriedCreateRef.current
        ) {
          hasTriedCreateRef.current = true;
          socket.send(JSON.stringify({ type: "create", payload: { roomId } }));
        } else {
          setError(data.payload.message);
        }
      }

      if (
        data.type === "room-created" ||
        data.type === "Success" ||
        data.type === "joined"
      ) {
        setIsJoined(true);
        setError("");
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsJoined(false);
    };

    socket.onerror = () => {
      setError("Connection error. Please try again.");
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  const sendMessage = (msg: string) => {
    if (!isConnected || !socketRef.current) {
      setError("Not connected to server");
      return;
    }

    if (!isJoined) {
      setError("Still joining the room. Try again in a second.");
      return;
    }

    socketRef.current.send(
      JSON.stringify({ type: "chat", payload: { message: msg } })
    );
  };

  const clearError = () => {
    setError("");
  };

  return {
    messages,
    sendMessage,
    error,
    clearError,
    isConnected,
  };
}
