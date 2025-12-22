import { Bell, User } from "lucide-react"

export default function Topbar() {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6">
      <div className="font-medium">Welcome!</div>

      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 opacity-70" />
        <User className="w-5 h-5 opacity-70" />
      </div>
    </header>
  )
}
