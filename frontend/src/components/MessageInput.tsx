import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [newMsg, setNewMsg] = useState("");

  const handleSend = () => {
    if (!newMsg.trim()) return;
    onSend(newMsg);
    setNewMsg("");
  };

  return (
    <div className="flex w-full max-w-md">
      <input
        className="flex-1 p-2 rounded-l-md bg-zinc-800 border border-zinc-700 outline-none"
        placeholder="Type a message..."
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        className="bg-green-500 px-4 rounded-r-md hover:bg-green-600 transition"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
