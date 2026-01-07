"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Plus, 
  Search,
  Edit2,
  Save,
  X,
  Smartphone,
  User,
  CheckCircle2,
  ClipboardList,
  CalendarClock,
  Trash2
} from "lucide-react";

// --- Types & Constants ---

interface Repair {
  id: string;
  customerName: string;
  device: string;
  phone: string;
  issue: string;
  status: string;
  priority: string;
  cost: string;
  dateReceived: string;
  estimatedCompletion: string;
  notes: string;
}

const REPAIR_ISSUES = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Water/Liquid Damage Treatment",
  "Back Glass Replacement",
  "Camera Repair (Front/Rear)",
  "Speaker/Mic Repair",
  "Software Issue / Boot Loop",
  "Motherboard Repair",
  "Diagnosis / Inspection"
];

// Mapping issues to specific checklist items
const ISSUE_CHECKLISTS: Record<string, string[]> = {
  "Battery Replacement": [
    "Screen Working",
    "Charging Port working",
    "Device Powers On",
    "Everything works"
  ],
  "Screen Replacement": [
    "Charging Port Working",
    "Battery Works",
    "Device Powers On",
    "Everything Works"
  ],
  "Charging Port Repair": [
    "Microphone Working",
    "Speaker Working",
    "Screen Works",
    "Battery Works"
  ],
  "default": [
    "Device Powers On",
    "Screen Works",
    "Charging Block Works",
    "Everything Works"
  ]
};

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    device: "",
    phone: "",
    issue: REPAIR_ISSUES[0], 
    status: "pending",
    priority: "medium",
    cost: "",
    dateReceived: new Date().toISOString().split('T')[0],
    estimatedCompletion: "",
    notes: "",
  });

  // Dynamic Checklist State
  const [activeChecklist, setActiveChecklist] = useState<Record<string, boolean>>({});

  const fetchRepairs = async () => {
    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/repairs");
      const data = await res.json();
      setRepairs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // Update checklist options when Issue changes
  useEffect(() => {
    const template = ISSUE_CHECKLISTS[formData.issue] || ISSUE_CHECKLISTS["default"];
    const newChecklist: Record<string, boolean> = {};
    template.forEach(item => {
      newChecklist[item] = false; 
    });
    setActiveChecklist(newChecklist);
  }, [formData.issue]);

  // Handle Checklist Toggles
  const toggleChecklist = (item: string) => {
    setActiveChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleAddRepair = async () => {
    setLoading(true);
    
    // Append checklist to notes
    const checklistSummary = Object.entries(activeChecklist)
      .map(([k, v]) => `${k}: ${v ? 'PASS' : 'FAIL'}`)
      .join(' | ');
    
    const finalData = {
      ...formData,
      notes: `[INSPECTION: ${checklistSummary}]\n${formData.notes}`
    };

    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      if (!res.ok) throw new Error("Failed to add repair");
      closeModal();
      fetchRepairs();
    } catch (err) {
      console.error(err);
      alert("Error adding repair. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRepair = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.blackfroglabs.co.za/api/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update repair");
      closeModal();
      fetchRepairs();
    } catch (err) {
      console.error(err);
      alert("Error updating repair.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (id: string, status: string) => {
    // Optimistic UI Update (Instant change before server responds)
    setRepairs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    try {
      await fetch(`https://api.blackfroglabs.co.za/api/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // We don't need to refetch here if we trust the optimistic update, 
      // but refetching ensures data consistency.
    } catch (err) {
      console.error(err);
      fetchRepairs(); // Revert on error
    }
  };

  const startEdit = (repair: Repair) => {
    setEditingId(repair.id);
    setFormData({
      customerName: repair.customerName || "",
      device: repair.device,
      phone: repair.phone,
      issue: repair.issue,
      status: repair.status,
      priority: repair.priority,
      cost: repair.cost,
      dateReceived: repair.dateReceived,
      estimatedCompletion: repair.estimatedCompletion,
      notes: repair.notes,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({
      customerName: "",
      device: "",
      phone: "",
      issue: REPAIR_ISSUES[0],
      status: "pending",
      priority: "medium",
      cost: "",
      dateReceived: new Date().toISOString().split('T')[0],
      estimatedCompletion: "",
      notes: "",
    });
  };

  const filteredRepairs = repairs.filter((repair) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      repair.device?.toLowerCase().includes(searchLower) ||
      repair.customerName?.toLowerCase().includes(searchLower) ||
      repair.phone?.includes(searchQuery) ||
      repair.id?.toLowerCase().includes(searchLower);
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && repair.status === filterStatus;
  });

  // --- STYLING HELPERS ---
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "in-progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "waiting-parts": return "bg-purple-50 text-purple-700 border-purple-200";
      case "ready": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed": return "bg-slate-50 text-slate-500 border-slate-200 line-through decoration-slate-400";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-400";
      default: return "bg-slate-300";
    }
  };

  return (
    <main className="min-h-screen bg-white p-2 md:p-6 text-slate-900 font-sans">
      
      {/* --- Top Bar --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Repairs</h1>
          {/* Quick Filters */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
             {["all", "pending", "in-progress", "waiting-parts", "ready", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`whitespace-nowrap text-[10px] uppercase font-bold px-2 py-1 rounded border transition-all ${
                  filterStatus === st 
                  ? "bg-slate-800 text-white border-slate-800" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {st.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => { closeModal(); setShowAddModal(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase rounded hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* --- DESKTOP TABLE (High Density) --- */}
      <div className="hidden md:block overflow-hidden border border-slate-200 rounded-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-r border-slate-200 w-14 text-center">ID</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-40">Customer</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-40">Device</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">Issue</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-24">Finish</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-28">Status</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-20 text-right">Cost</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-12 text-center">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRepairs.map((repair) => (
              <tr key={repair.id} className="hover:bg-blue-50/40 group transition-colors">
                
                {/* ID */}
                <td className="px-2 py-1 text-[11px] text-slate-400 font-mono text-center border-r border-slate-100">
                  {repair.id.slice(-4)}
                </td>

                {/* Customer */}
                <td className="px-2 py-1">
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] font-bold text-slate-800 truncate block max-w-[150px]">
                      {repair.customerName || "Walk-in"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">
                      {repair.phone}
                    </span>
                  </div>
                </td>

                {/* Device */}
                <td className="px-2 py-1 text-[11px] text-slate-700 font-medium truncate max-w-[150px]">
                  {repair.device}
                </td>

                {/* Issue */}
                <td className="px-2 py-1 text-[11px] text-slate-600 truncate max-w-[200px]" title={repair.issue}>
                  {repair.issue}
                </td>

                 {/* Est Completion */}
                 <td className="px-2 py-1">
                  {repair.estimatedCompletion ? (
                     <div className="flex items-center gap-1 text-[10px] text-slate-600">
                       <CalendarClock size={10} className="text-slate-400"/>
                       {repair.estimatedCompletion}
                     </div>
                  ) : (
                    <span className="text-[10px] text-slate-300">-</span>
                  )}
                </td>

                {/* Status Dropdown */}
                <td className="px-2 py-1">
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(repair.priority)}`} />
                      <select
                        value={repair.status}
                        onChange={(e) => handleQuickStatusUpdate(repair.id, e.target.value)}
                        className={`
                          appearance-none w-full text-[10px] font-bold uppercase py-0.5 px-2 rounded 
                          border ${getStatusStyle(repair.status)} 
                          cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500
                        `}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">Working</option>
                        <option value="waiting-parts">Parts</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Done</option>
                      </select>
                   </div>
                </td>

                {/* Cost */}
                <td className="px-2 py-1 text-right text-[11px] font-bold text-slate-900">
                  {repair.cost ? `R${repair.cost}` : "-"}
                </td>

                {/* Actions */}
                <td className="px-2 py-1 text-center">
                  <button 
                    onClick={() => startEdit(repair)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Edit Details"
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRepairs.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">No repairs found matching your criteria.</div>
        )}
      </div>

      {/* --- MOBILE LIST --- */}
      <div className="md:hidden space-y-2">
        {filteredRepairs.map((repair) => (
          <div key={repair.id} onClick={() => startEdit(repair)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm active:scale-[0.99] transition-transform">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-bold text-xs text-slate-900">{repair.customerName || "Walk-in"}</h3>
                <p className="text-[10px] text-slate-500">{repair.device}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase rounded border ${getStatusStyle(repair.status)}`}>
                {repair.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-50 pt-1 mt-1">
               <span>{repair.issue}</span>
               <span className="font-bold text-slate-900">R{repair.cost}</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL (Add/Edit) --- */}
      {(showAddModal || editingId) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {editingId ? "Edit Repair" : "New Repair Intake"}
              </h2>
              <button onClick={closeModal}><X size={18} className="text-slate-400 hover:text-red-500 transition-colors" /></button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
              
              {/* Customer Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <User size={10} /> Customer Name
                  </label>
                  <input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Smartphone size={10} /> Phone
                  </label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="082 123 4567"
                  />
                </div>
              </div>

              {/* Device Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Device Model</label>
                   <input
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="iPhone 14 Pro"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Issue Category</label>
                   <select
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {REPAIR_ISSUES.map((issue) => (
                      <option key={issue} value={issue}>{issue}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DYNAMIC CHECKLIST (Radio/Checkbox Style) */}
              {!editingId && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ClipboardList size={12} /> 
                    Pre-Repair Checklist
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(activeChecklist).map((checkItem) => (
                      <label 
                        key={checkItem} 
                        className={`
                          flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all select-none
                          ${activeChecklist[checkItem] 
                            ? "bg-green-50 border-green-200 text-green-800 shadow-sm" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }
                        `}
                      >
                        <div className={`
                          w-4 h-4 rounded-full flex items-center justify-center border transition-colors
                          ${activeChecklist[checkItem] ? "bg-green-500 border-green-500" : "bg-white border-slate-300"}
                        `}>
                          {activeChecklist[checkItem] && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={activeChecklist[checkItem]}
                          onChange={() => toggleChecklist(checkItem)}
                          className="hidden"
                        />
                        <span className="text-[11px] font-medium leading-tight">{checkItem}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Data Row */}
              <div className="grid grid-cols-3 gap-3">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Cost (R)</label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Est. Finish</label>
                    <input
                      type="date"
                      value={formData.estimatedCompletion}
                      onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Technician Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Internal notes..."
                />
              </div>

            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex gap-3">
              <button 
                onClick={closeModal} 
                className="flex-1 px-4 py-2.5 text-xs font-bold uppercase text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => editingId ? handleUpdateRepair(editingId) : handleAddRepair()}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-xs font-bold uppercase text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {editingId ? "Save Changes" : "Create Repair"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
