import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [newMsg, setNewMsg] = useState("");

  const handleSend = () => {
    const trimmed = newMsg.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setNewMsg("");
  };

  return (
    <div className="flex w-full max-w-md gap-2 p-2">
      <input
        className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
        placeholder="Type a message..."
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
      />
      <button
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
        onClick={handleSend}
        disabled={!newMsg.trim()}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
}
