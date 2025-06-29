import { useEffect, useRef } from "react";

interface Message {
  message: string;
  sender: "me" | "other";
}

type Props = {
  messages: Message[];
  bottomRef: React.MutableRefObject<HTMLDivElement | null>;
};

export default function ChatBox({ messages, bottomRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, bottomRef]);

  return (
    <div className="bg-zinc-900 w-full max-w-md h-full max-h-[calc(100vh-200px)] overflow-y-auto rounded-xl p-3 shadow-md border border-zinc-800">
      <div ref={containerRef} className="space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 text-sm break-words leading-relaxed rounded-2xl ${
                msg.sender === "me"
                  ? "bg-green-500 text-white rounded-br-md"
                  : "bg-gray-600 text-white rounded-bl-md"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
