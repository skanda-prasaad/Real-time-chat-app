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
  const hasTriedCreateRef = useRef(false);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket("wss://replace-me.onrender.com");

    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setHasJoined(false);
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
        setHasJoined(true); // Defensive — mark joined if chat is received
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

    if (!hasJoined) {
      setError("Not joined to room yet");
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
