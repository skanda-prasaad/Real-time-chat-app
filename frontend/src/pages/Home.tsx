import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  function joinRoom() {
    if (roomId.length != 6) {
      alert("Invalid Room code");
      return;
    }
    navigate(`/room/${roomId}`);
  }

  function createRoom() {
    const socket = new WebSocket("ws://localhost:8008");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "create" }));
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "room-created") {
        navigate(`/room/${data.payload.roomId}`);
      }
    };
  }
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-[400px] text-center">
          <h1 className="text-2xl font-bold mb-2">💬 Real Time Chat</h1>
          <p className="text-sm text-gray-400 mb-6">
            Temporary room expires after both users leave.
          </p>

          <button
            className="w-full bg-white text-black py-2 rounded-lg mb-4 font-semibold transition hover:bg-gray-200"
            onClick={createRoom}
          >
            Create Room
          </button>

          <input
            className="w-full p-2 rounded-md bg-zinc-800 mb-4"
            placeholder="Enter Room Code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          />

          <button
            className="w-full bg-zinc-700 text-white py-2 rounded-lg hover:bg-zinc-600"
            onClick={joinRoom}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
