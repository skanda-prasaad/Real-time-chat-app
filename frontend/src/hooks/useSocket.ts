import { useEffect, useRef, useState } from "react";

interface Message {
  message: string;
  sender: "me" | "other";
}

export default function useSocket(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const hasJoinedRef = useRef(false);
  const hasTriedCreateRef = useRef(false);

  useEffect(() => {
    // Clean up previous connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket("ws://localhost:8008");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      hasJoinedRef.current = false;
      hasTriedCreateRef.current = false;

      if (roomId) {
        // Try to join the room first
        console.log("Attempting to join room:", roomId);
        socket.send(JSON.stringify({ type: "join", payload: { roomId } }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data.type, data);

      if (data.type === "chat") {
        console.log("Adding message:", data.payload);
        setMessages((prev) => [
          ...prev,
          { message: data.payload.message, sender: data.payload.sender },
        ]);
      }

      if (data.type === "error") {
        console.log("Error:", data.payload.message);

        // If room doesn't exist and we haven't tried creating it yet, create it
        if (data.payload.message === "Invalid room code." && !hasTriedCreateRef.current) {
          console.log("Room doesn't exist, creating it instead");
          hasTriedCreateRef.current = true;
          socket.send(JSON.stringify({ type: "create", payload: { roomId } }));
        } else {
          setError(data.payload.message);
        }
      }

      if (data.type === "room-created") {
        console.log("Room created:", data.payload.roomId);
        hasJoinedRef.current = true;
        setError("");
      }

      if (data.type === "Success") {
        console.log("Successfully joined room");
        hasJoinedRef.current = true;
        setError("");
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      hasJoinedRef.current = false;
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
      setError("Connection error. Please try again.");
    };

    return () => {
      console.log("Cleaning up WebSocket connection");
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

    if (!hasJoinedRef.current) {
      setError("Not joined to room yet");
      return;
    }

    console.log("Sending message:", msg);
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
    isConnected
  };
}
