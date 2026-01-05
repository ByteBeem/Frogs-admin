"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Wrench, 
  CalendarDays, 
  MessageSquare, 
  ShoppingCart,
  ArrowUpRight
} from "lucide-react";

// Define Types
interface DashboardData {
  stats: {
    activeRepairs: number;
    bookingsToday: number;
    openChats: number;
    orders: number;
  };
  recentRepairs: Array<{
    id: string;
    device: string;
    status: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("https://api.blackfroglabs.co.za/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // Helper to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="grid gap-6 p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat 
          title="Active Repairs" 
          value={data?.stats.activeRepairs || 0} 
          icon={<Wrench className="text-emerald-500" size={20} />}
        />
        <Stat 
          title="New Jobs Today" 
          value={data?.stats.bookingsToday || 0} 
          icon={<CalendarDays className="text-blue-500" size={20} />}
        />
        <Stat 
          title="Open Chats" 
          value={data?.stats.openChats || 0} 
          icon={<MessageSquare className="text-purple-500" size={20} />}
        />
        <Stat 
          title="Orders" 
          value={data?.stats.orders || 0} 
          icon={<ShoppingCart className="text-orange-500" size={20} />}
        />
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Repairs Column */}
        <div className="lg:col-span-2">
          <Card title="Recent Repairs">
            {data?.recentRepairs.length === 0 ? (
              <p className="text-sm text-slate-500">No recent repairs found.</p>
            ) : (
              <div className="space-y-4">
                {data?.recentRepairs.map((repair) => (
                  <div key={repair.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-900">{repair.device}</p>
                      <p className="text-xs text-slate-500">
                        ID: {repair.id.slice(0, 8)}... • {formatDate(repair.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${repair.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {repair.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Side Column (Placeholders for now) */}
        <div className="space-y-6">
          <Card title="Latest Bookings">
            <div className="text-sm text-slate-500 py-8 text-center bg-slate-50 rounded-lg border-dashed border border-slate-200">
              Booking system integration coming soon.
            </div>
          </Card>
          <Card title="Open Chats">
            <div className="text-sm text-slate-500 py-8 text-center bg-slate-50 rounded-lg border-dashed border border-slate-200">
              Chat system integration coming soon.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function Stat({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-slate-600">{title}</div>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="font-semibold text-slate-900">{title}</div>
        <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
          View All <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
