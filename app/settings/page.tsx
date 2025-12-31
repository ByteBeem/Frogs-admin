import SettingsShell from "@/components/settings/SettingsShell";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function SettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Topbar />

        {/* Page Content */}
        <main className="p-6 md:p-10">
          <SettingsShell />
        </main>
      </div>
    </div>
  );
}
