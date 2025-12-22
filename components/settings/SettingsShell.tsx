"use client"

import { useState } from "react"
import {
  Building2,
  Wrench,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Users,
  Bell,
  Shield
} from "lucide-react"

import GeneralSettings from "./sections/GeneralSettings"
import RepairSettings from "./sections/RepairSettings"

const tabs = [
  { id: "general", label: "General", icon: Building2 },
  { id: "repairs", label: "Repair Workflow", icon: Wrench },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "shop", label: "Shop", icon: ShoppingCart },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
]

export default function SettingsShell() {
  const [active, setActive] = useState("general")

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="md:w-64 shrink-0">
        <div className="rounded-xl border bg-background p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                ${active === tab.id ? "bg-muted font-medium" : "hover:bg-muted"}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <section className="flex-1">
        <div className="rounded-xl border bg-background p-6">
          {active === "general" && <GeneralSettings />}
          {active === "repairs" && <RepairSettings />}
          {active !== "general" && active !== "repairs" && (
            <Placeholder title={tabs.find(t => t.id === active)?.label} />
          )}
        </div>
      </section>
    </div>
  )
}

function Placeholder({ title }: { title?: string }) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <h3 className="font-medium text-lg">{title}</h3>
      <p className="text-sm mt-2">Settings coming soon</p>
    </div>
  )
}
