"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Package, 
  Plus, 
  Trash2, 
  Search,
  Phone,
  Mail,
  User,
  Edit2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";

interface Repair {
  id: string;
  device: string;
  customerName: string;
  phone: string;
  email: string;
  issue: string;
  status: string;
  priority: string;
  cost: string;
  dateReceived: string;
  estimatedCompletion: string;
  notes: string;
}

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    device: "",
    customerName: "",
    phone: "",
    email: "",
    issue: "",
    status: "pending",
    priority: "medium",
    cost: "",
    dateReceived: new Date().toISOString().split('T')[0],
    estimatedCompletion: "",
    notes: "",
  });

  const fetchRepairs = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/repairs");
      const data = await res.json();
      setRepairs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleAddRepair = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add repair");
      resetForm();
      setShowAddModal(false);
      fetchRepairs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRepair = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update repair");
      setEditingId(null);
      resetForm();
      fetchRepairs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repair?")) return;
    try {
      await fetch(`http://localhost:3000/api/repairs/${id}`, { method: "DELETE" });
      fetchRepairs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusUpdate = async (id: string, status: string) => {
    try {
      await fetch(`http://localhost:3000/api/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchRepairs();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (repair: Repair) => {
    setEditingId(repair.id);
    setFormData({
      device: repair.device,
      customerName: repair.customerName,
      phone: repair.phone,
      email: repair.email,
      issue: repair.issue,
      status: repair.status,
      priority: repair.priority,
      cost: repair.cost,
      dateReceived: repair.dateReceived,
      estimatedCompletion: repair.estimatedCompletion,
      notes: repair.notes,
    });
  };

  const resetForm = () => {
    setFormData({
      device: "",
      customerName: "",
      phone: "",
      email: "",
      issue: "",
      status: "pending",
      priority: "medium",
      cost: "",
      dateReceived: new Date().toISOString().split('T')[0],
      estimatedCompletion: "",
      notes: "",
    });
  };

  // Filter repairs
  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.device?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.phone?.includes(searchQuery) ||
      repair.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && repair.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "waiting-parts": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ready": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-orange-100 text-orange-700 border-orange-200";
      case "low": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const stats = {
    total: repairs.length,
    pending: repairs.filter((r) => r.status === "pending").length,
    inProgress: repairs.filter((r) => r.status === "in-progress").length,
    completed: repairs.filter((r) => r.status === "completed").length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent" />
      
      <div className="relative z-10 p-6 md:p-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Repairs Management
            </h1>
            <p className="text-slate-600 text-lg">Complete control over all device repairs</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Add New Repair
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-slate-600 font-medium mb-1">Total</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-slate-600 font-medium mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-slate-600 font-medium mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-slate-600 font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by device, customer, phone, or ID..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting-parts">Waiting Parts</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Repairs Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Device</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Issue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRepairs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No repairs found</p>
                      <p className="text-sm text-slate-500">Add a new repair to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredRepairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Package className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{repair.device}</p>
                            <p className="text-xs text-slate-500 font-mono">#{repair.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{repair.customerName}</p>
                        <p className="text-sm text-slate-600">{repair.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 max-w-xs truncate">{repair.issue}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={repair.status}
                          onChange={(e) => handleQuickStatusUpdate(repair.id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(repair.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="waiting-parts">Waiting Parts</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getPriorityColor(repair.priority)}`}>
                          {repair.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">${repair.cost || "TBD"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{repair.dateReceived}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(repair)}
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Edit repair"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(repair.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete repair"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingId) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? "Edit Repair" : "Add New Repair"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Device & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Package size={16} className="text-emerald-600" />
                    Device Name *
                  </label>
                  <input
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    placeholder="e.g., iPhone 14 Pro"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-cyan-600" />
                    Customer Name *
                  </label>
                  <input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone size={16} className="text-emerald-600" />
                    Phone Number *
                  </label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail size={16} className="text-cyan-600" />
                    Email
                  </label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Issue Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Issue Description *</label>
                <textarea
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="waiting-parts">Waiting Parts</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Repair Cost ($)</label>
                  <input
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Date Received</label>
                  <input
                    value={formData.dateReceived}
                    onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Estimated Completion</label>
                  <input
                    value={formData.estimatedCompletion}
                    onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any internal notes or comments..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingId ? handleUpdateRepair(editingId) : handleAddRepair()}
                  disabled={loading || !formData.device || !formData.customerName || !formData.phone || !formData.issue}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingId ? "Update Repair" : "Add Repair"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}