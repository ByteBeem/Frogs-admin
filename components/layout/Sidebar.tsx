"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Wrench, MessageSquare, ShoppingCart, Settings, ChevronRight, Zap } from "lucide-react";

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Repairs", href: "/repairs", icon: Wrench },
  { name: "Live Chat", href: "/chat", icon: MessageSquare },
  { name: "Shop", href: "/shop/orders", icon: ShoppingCart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-72 flex-col bg-gradient-to-b from-white via-slate-50 to-white border-r border-slate-200 shadow-xl">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-cyan-50 opacity-50" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Zap className="text-white" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Black Frog Labs
            </h1>
            <p className="text-xs text-slate-500 font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 bg-gradient-to-b from-emerald-600 to-cyan-600 rounded-r-full" />
              )}

              {/* Icon */}
              <div
                className={`
                  flex-shrink-0 transition-transform duration-300 ease-out
                  ${isActive ? "scale-110" : "group-hover:scale-110"}
                `}
              >
                <item.icon
                  size={20}
                  className={isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-600"}
                  strokeWidth={2}
                />
              </div>

              {/* Label */}
              <span className="flex-1">{item.name}</span>

              {/* Chevron */}
              <ChevronRight
                size={16}
                className={`
                  transition-all duration-300 ease-out
                  ${isActive ? "opacity-100 translate-x-0 text-white" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-emerald-600"}
                `}
              />

              {/* Hover glow effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
              AL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}