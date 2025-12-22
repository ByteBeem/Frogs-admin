"use client"

import { Send } from "lucide-react"
import { useState } from "react"

export default function MessageInput() {
  const [text, setText] = useState("")

  return (
    <form className="border-t p-3 flex gap-2 items-center">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a reply…"
        className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <button
        className="bg-black text-white p-2 rounded-md"
        aria-label="Send"
      >
        <Send size={16} />
      </button>
    </form>
  )
}
