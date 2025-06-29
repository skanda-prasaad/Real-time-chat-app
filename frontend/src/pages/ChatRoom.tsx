import { useParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";
import { useRef, useEffect } from "react";

export default function ChatRoom() {
  const { roomId } = useParams();
  const { messages, sendMessage } = useSocket(roomId as string);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 font-mono">
      <h2 className="text-xl mb-4">
        🟢 Room: <span className="text-green-400">{roomId}</span>
      </h2>

      <ChatBox messages={messages} bottomRef={bottomRef} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
