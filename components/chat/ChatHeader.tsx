import { Phone, X } from "lucide-react"

export default function ChatHeader() {
  return (
    <div className="h-16 border-b px-4 flex items-center justify-between">
      <div>
        <div className="font-medium">Visitor #1023</div>
        <div className="text-xs text-muted-foreground">
          Online • iPhone 13 • Repair ID #889
        </div>
      </div>

      <div className="flex gap-3">
        
        <X size={18} className="opacity-70" />
      </div>
    </div>
  )
}
