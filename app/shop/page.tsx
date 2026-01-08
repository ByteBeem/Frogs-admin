"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

// --- Types ---
interface Order {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  total_amount: number;
  status: string; 
  delivery_method: string;
  created_at: string;
  items: any;
}

// --- Status Options ---
const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "ready", label: "Ready", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
];

// --- Stats Component ---
const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
    <div className={`p-2 rounded-lg ${bg} ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium">{title}</p>
      <h3 className="text-xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export default function ShopDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`https://api.blackfroglabs.co.za/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Derived Stats
  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toString().includes(search)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Shop Orders</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage and track customer orders.</p>
            </div>
            <Link
              href="/shop/products"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              <Package size={16} /> Manage Products
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={`R${totalRevenue.toFixed(2)}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Pending" value={pendingOrders} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
            <StatCard title="Completed" value={completedOrders} icon={CheckCircle} color="text-purple-600" bg="bg-purple-50" />
          </div>

          {/* Orders Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            
            {/* Table Header Controls */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-base font-bold text-slate-800">Order List</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-56 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-9 pr-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3 w-40">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading orders...</td></tr>
                  ) : filteredOrders.map((order) => {
                    const currentStatusStyle = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];
                    const itemCount = typeof order.items === 'string' ? JSON.parse(order.items).length : order.items?.length || 0;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* ID */}
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          #{order.id}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{order.customer_name}</span>
                            <span className="text-[10px] text-slate-500">{order.email}</span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3">
                           <div className="flex flex-col">
                             <span className="font-bold text-slate-700">R{order.total_amount}</span>
                             <span className="text-[10px] text-slate-400">{itemCount} items</span>
                           </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>

                        {/* Delivery */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-600 capitalize">
                            {order.delivery_method === 'delivery' ? <Truck size={14} /> : <Package size={14} />}
                            {order.delivery_method}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                           <div className="relative">
                              {updatingId === order.id ? (
                                <div className="text-[10px] text-emerald-600 font-medium animate-pulse">Updating...</div>
                              ) : (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  className={`
                                    w-full appearance-none cursor-pointer
                                    py-1 pl-2 pr-6 rounded-md text-[10px] font-bold uppercase tracking-wide
                                    border focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all
                                    ${currentStatusStyle.color}
                                  `}
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {!updatingId && (
                                <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none ${currentStatusStyle.color.split(' ')[1]}`} />
                              )}
                           </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <button className="text-slate-400 hover:text-emerald-600 transition-colors p-1">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
