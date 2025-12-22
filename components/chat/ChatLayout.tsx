"use client"

import { useState } from "react"
import ConversationList from "./ConversationList"
import ChatWindow from "./ChatWindow"

export default function ChatLayout() {
  const [activeId, setActiveId] = useState<string | null>("1")

  return (
    <div className="flex h-[calc(100vh-4rem)] rounded-xl border bg-background overflow-hidden">
      {/* Left panel */}
      <ConversationList
        activeId={activeId}
        onSelect={setActiveId}
      />

      {/* Right panel */}
      <div className="flex-1">
        {activeId ? (
          <ChatWindow />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      Select a conversation to start chatting
    </div>
  )
}
