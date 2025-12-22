import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
