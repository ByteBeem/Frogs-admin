import { MessageSquare } from "lucide-react"

const conversations = [
  {
    id: "1",
    name: "Visitor #1023",
    last: "Is my phone ready?",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "John D.",
    last: "Thanks!",
    unread: 0,
    online: false,
  },
]

export default function ConversationList({
  activeId,
  onSelect,
}: any) {
  return (
    <aside className="w-80 border-r hidden md:flex flex-col">
      <div className="p-4 border-b font-medium flex items-center gap-2">
        <MessageSquare size={18} />
        Conversations
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-4 py-3 border-b hover:bg-muted
              ${activeId === c.id ? "bg-muted" : ""}
            `}
          >
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm">{c.name}</div>
              {c.online && (
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>

            <div className="text-xs text-muted-foreground truncate">
              {c.last}
            </div>

            {c.unread > 0 && (
              <div className="mt-1 inline-block text-xs bg-black text-white px-2 rounded-full">
                {c.unread}
              </div>
            )}
          </button>
        ))}
      </div>
    </aside>
  )
}
