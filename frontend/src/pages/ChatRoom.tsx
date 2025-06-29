import { useParams, useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";
import Toast from "../components/Toast";
import { useRef, useEffect, useState } from "react";

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { messages, sendMessage, error, clearError, isConnected } = useSocket(roomId as string);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "warning";
    isVisible: boolean;
  }>({
    message: "",
    type: "error",
    isVisible: false,
  });

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error", isVisible: true });
      clearError();
    }
  }, [error, clearError]);

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-mono overflow-hidden">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 p-3 flex-shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              ← Back
            </button>
            <div className="text-center flex-1">
              <h2 className="text-lg font-semibold truncate">
                🟢 Room: <span className="text-green-400 font-mono">{roomId}</span>
              </h2>
              <div className="flex items-center justify-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex items-center justify-center p-2">
            <ChatBox messages={messages} bottomRef={bottomRef} />
          </div>
          <div className="flex-shrink-0 flex justify-center p-2">
            <MessageInput onSend={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
