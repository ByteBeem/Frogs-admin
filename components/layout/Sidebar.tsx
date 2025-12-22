import Link from "next/link"
import { LayoutDashboard, Calendar, Wrench, MessageSquare, ShoppingCart, Settings } from "lucide-react"

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Repairs", href: "/repairs", icon: Wrench },
  { name: "Live Chat", href: "/chat", icon: MessageSquare },
  { name: "Shop", href: "/shop/orders", icon: ShoppingCart },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="h-16 flex items-center px-6 font-bold text-lg">
        BlackFrogs Labs
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {nav.map(item => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
