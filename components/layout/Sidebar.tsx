"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  MessageSquare, 
  ShoppingCart, 
  Settings, 
  ChevronRight, 
  Zap,
  Menu, 
  X,
  PanelLeftClose, // Icon to collapse sidebar
  PanelLeftOpen   // Icon to expand sidebar
} from "lucide-react";

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Repairs", href: "/repairs", icon: Wrench },
  { name: "Live Chat", href: "/chat", icon: MessageSquare },
  { name: "Shop", href: "/shop", icon: ShoppingCart },
  
];

export default function Sidebar() {
  const pathname = usePathname();
  // State for Mobile Open/Close
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State for Desktop Collapse/Expand
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileOpen]);

  return (
    <>
      {/* =========================================================
          MOBILE HEADER (Visible only on small screens)
      ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Black Frog
          </span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* =========================================================
          MOBILE BACKDROP OVERLAY
      ========================================================= */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* =========================================================
          SIDEBAR (Desktop & Mobile)
      ========================================================= */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          flex flex-col bg-gradient-to-b from-white via-slate-50 to-white 
          border-r border-slate-200 shadow-xl
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "w-72"} 
        `}
      >
        {/* --- LOGO HEADER --- */}
        <div className={`
          h-20 flex items-center border-b border-slate-200 relative overflow-hidden shrink-0
          ${isCollapsed ? "justify-center px-2" : "justify-between px-6"}
        `}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-cyan-50 opacity-50" />
          
          {/* Logo & Text Wrapper */}
          <div className={`relative flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Zap className="text-white" size={24} strokeWidth={2.5} />
            </div>
            
            {/* Title Text (Hidden when collapsed) */}
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                  Black Frog Labs
                </h1>
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Admin Portal</p>
              </div>
            )}
          </div>

          {/* ACTIONS: Close (Mobile) OR Collapse (Desktop) */}
          
          {/* 1. Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden relative p-2 text-slate-500 hover:text-red-500 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* 2. Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex relative p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative flex items-center rounded-xl transition-all duration-300 ease-out
                  ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3.5"}
                  ${isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-b from-emerald-600 to-cyan-600 rounded-r-full
                    ${isCollapsed ? "w-1 h-6" : "w-1 h-9"}
                  `} />
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  <item.icon
                    size={20}
                    className={isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-600"}
                    strokeWidth={2}
                  />
                </div>

                {/* Text Label (Hidden when collapsed) */}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.name}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`
                        transition-all duration-300 
                        ${isActive ? "opacity-100 translate-x-0 text-white" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-emerald-600"}
                      `}
                    />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* --- FOOTER / EXPAND BUTTON --- */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          
          {/* Expand Button (Only visible when collapsed on Desktop) */}
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="hidden md:flex w-full items-center justify-center p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={24} />
            </button>
          ) : (
            // Full User Profile Card
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                  AL
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
                  <p className="text-xs text-slate-500 truncate">Administrator</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
