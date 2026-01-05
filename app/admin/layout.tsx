// app/admin/layout.tsx (or wherever your AdminLayout is located)

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AdminChatListener from "./AdminChatListener"; // Import the component

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* This component has no UI (returns null), but it will sit here 
        silently listening for notifications and handling sound 
        while you navigate through different admin pages.
      */}
      <AdminChatListener />

      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
