import MessageBubble from "./MessageBubble"

const messages = [
  { id: 1, sender: "visitor", text: "Hi, is my phone ready?" },
  { id: 2, sender: "admin", text: "Hi! It will be ready today." },
]

export default function MessageList() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
      {messages.map(m => (
        <MessageBubble key={m.id} {...m} />
      ))}
    </div>
  )
}
