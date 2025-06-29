import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "error" as "error" | "success" | "warning",
    isVisible: false,
  });

  const navigate = useNavigate();

  const showToast = (
    message: string,
    type: "error" | "success" | "warning" = "error"
  ) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const joinRoom = () => {
    if (roomId.trim().length !== 6) {
      showToast("Invalid room code.");
      return;
    }
    navigate(`/room/${roomId.trim()}`);
  };

  const createRoom = () => {
    if (isCreating) return;
    setIsCreating(true);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    navigate(`/room/${code}`);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-mono">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-zinc-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-zinc-800">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              💬 Real Time Chat
            </h1>
            <p className="text-sm text-gray-400">
              Temporary room expires after both users leave.
            </p>
          </div>

          <div className="space-y-6">
            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                isCreating
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
              onClick={createRoom}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "🚀 Create Room"}
            </button>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔑</span>
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter Room Code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              />
            </div>

            <button
              className="w-full bg-zinc-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-zinc-600 transform hover:scale-105 shadow-lg"
              onClick={joinRoom}
              disabled={isCreating}
            >
              ➡️ Join Room
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-500 space-y-1">
            <p>• Rooms are limited to 2 users maximum</p>
            <p>• Messages are not persistent</p>
            <p>• Room codes are 6 characters long</p>
          </div>
        </div>
      </div>
    </div>
  );
}
