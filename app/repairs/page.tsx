import RepairsTable from "@/components/repairs/RepairsTable";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function RepairsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Topbar />

        {/* Page Content */}
        <main className="p-6 md:p-10 space-y-6 relative">
          {/* Subtle gradient background behind table */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/20 via-transparent to-transparent pointer-events-none" />

          <RepairsTable />
        </main>
      </div>
    </div>
  );
}
