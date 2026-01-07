"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  User, 
  Smartphone, 
  MoreHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

// --- Types ---
interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  device: string;
  issue: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: string;
  notes: string;
}

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  // --- Fetch Data ---
  const fetchBookings = async () => {
    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Actions ---
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    // Optimistic update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (selectedBooking) setSelectedBooking({ ...selectedBooking, status: newStatus });

    try {
      await fetch(`https://api.blackfroglabs.co.za/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchBookings(); // Revert
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    setBookings(prev => prev.filter(b => b.id !== id));
    setSelectedBooking(null);

    try {
      await fetch(`https://api.blackfroglabs.co.za/api/bookings/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
      fetchBookings();
    }
  };

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      "no-show": "bg-slate-100 text-slate-500 border-slate-200 line-through",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" />Loading bookings...</div>;

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p>No bookings found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full text-sm hidden md:table">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="text-left p-4">Booking ID</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Device</th>
                  <th className="text-left p-4">Date & Time</th>
                  <th className="text-left p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedBooking(b)}>
                    <td className="p-4 font-mono text-slate-400">#{b.id.slice(0,6)}</td>
                    <td className="p-4 font-medium text-slate-900">
                      {b.customerName}
                      <div className="text-xs text-slate-400 font-normal">{b.phone}</div>
                    </td>
                    <td className="p-4 text-slate-600">{b.device}</td>
                    <td className="p-4">
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-slate-700">{formatDate(b.date)}</span>
                        <span className="text-slate-500">{b.time?.slice(0,5)}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(b.status)}</td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 space-y-3 bg-white active:bg-slate-50" onClick={() => setSelectedBooking(b)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900">{b.device}</div>
                      <div className="text-xs text-slate-500">#{b.id.slice(0,6)}</div>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={14} className="text-slate-400"/>
                    {b.customerName}
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Clock size={14} className="text-blue-500" />
                      {formatDate(b.date)} • {b.time?.slice(0,5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- MANAGEMENT MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Manage Booking</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedBooking.id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Customer</label>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <User size={16} className="text-emerald-500" />
                    {selectedBooking.customerName}
                  </div>
                  <div className="text-xs text-slate-500 pl-6">{selectedBooking.phone}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Device</label>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Smartphone size={16} className="text-blue-500" />
                    {selectedBooking.device}
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Appointment</label>
                   <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Calendar size={16} className="text-purple-500" />
                    {formatDate(selectedBooking.date)}
                  </div>
                  <div className="text-xs text-slate-500 pl-6">at {selectedBooking.time?.slice(0,5)}</div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Current Status</label>
                   <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>

              {/* Issue Note */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-start gap-2">
                   <FileText size={16} className="text-slate-400 mt-0.5" />
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase">Reported Issue</p>
                     <p className="text-sm text-slate-700">{selectedBooking.issue || "No details provided"}</p>
                   </div>
                </div>
              </div>

              {/* Status Actions */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                    disabled={selectedBooking.status === 'confirmed'}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-blue-50 border-slate-200 text-slate-600 disabled:opacity-50 disabled:bg-blue-100 disabled:text-blue-700 disabled:border-blue-200"
                  >
                    <CheckCircle2 size={14} /> Confirm
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, "completed")}
                    disabled={selectedBooking.status === 'completed'}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-emerald-50 border-slate-200 text-slate-600 disabled:opacity-50 disabled:bg-emerald-100 disabled:text-emerald-700 disabled:border-emerald-200"
                  >
                    <CheckCircle2 size={14} /> Complete
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                    disabled={selectedBooking.status === 'cancelled'}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-red-50 border-slate-200 text-slate-600 disabled:opacity-50 disabled:bg-red-100 disabled:text-red-700 disabled:border-red-200"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, "no-show")}
                    disabled={selectedBooking.status === 'no-show'}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-slate-100 border-slate-200 text-slate-600 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    <AlertCircle size={14} /> No Show
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button 
                onClick={() => handleDelete(selectedBooking.id)}
                className="text-red-500 text-sm font-medium hover:underline"
              >
                Delete Booking
              </button>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
