type Props = {
  messages: { message: string }[];
  bottomRef: React.MutableRefObject<HTMLDivElement | null>;
};

export default function ChatBox({ messages, bottomRef }: Props) {
  return (
    <div className="bg-zinc-900 w-full max-w-md h-[400px] overflow-y-auto rounded-xl p-4 mb-4 shadow-md border border-zinc-800">
      {messages.map((msg, i) => (
        <div key={i} className="mb-2 text-sm text-gray-200">
          {msg.message}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
