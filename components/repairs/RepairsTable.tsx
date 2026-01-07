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
  AlertOctagon, 
  Check,
  CalendarDays 
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
  checklist: Record<string, boolean>; 
  failureReason?: string; 
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

const ISSUE_CHECKLISTS: Record<string, string[]> = {
  "Battery Replacement": ["Screen Working", "Charging Port working", "Device Powers On", "Everything works"],
  "Screen Replacement": ["Charging Port Working", "Battery Works", "Device Powers On", "Everything Works"],
  "Charging Port Repair": ["Microphone Working", "Speaker Working", "Screen Works", "Battery Works"],
  "default": ["Device Powers On", "Screen Works", "Charging Block Works", "Everything Works"]
};

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReasonId, setFailReasonId] = useState<string | null>(null);
  const [tempFailReason, setTempFailReason] = useState("");

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
    checklist: {} as Record<string, boolean>,
    failureReason: ""
  });

  const fetchRepairs = async () => {
    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/repairs");
      const data = await res.json();
      const safeData = data.map((r: any) => ({
        ...r,
        checklist: r.checklist || {}
      }));
      setRepairs(safeData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  useEffect(() => {
    if (!editingId) {
      const template = ISSUE_CHECKLISTS[formData.issue] || ISSUE_CHECKLISTS["default"];
      const newChecklist: Record<string, boolean> = {};
      template.forEach(item => {
        newChecklist[item] = false; 
      });
      setFormData(prev => ({ ...prev, checklist: newChecklist }));
    }
  }, [formData.issue, editingId]);

  const toggleChecklist = (item: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [item]: !prev.checklist[item] }
    }));
  };

  const handleAddRepair = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add repair");
      closeModal();
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
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    if (newStatus === "unfixable") {
      setFailReasonId(id);
      setTempFailReason("");
      setShowFailModal(true);
    } else {
      handleQuickStatusUpdate(id, newStatus);
    }
  };

  const handleQuickStatusUpdate = async (id: string, status: string, failureReason?: string) => {
    setRepairs(prev => prev.map(r => r.id === id ? { ...r, status, failureReason: failureReason || r.failureReason } : r));
    try {
      await fetch(`https://api.blackfroglabs.co.za/api/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, failureReason }),
      });
    } catch (err) {
      console.error(err);
      fetchRepairs();
    }
  };

  const submitFailReason = () => {
    if (failReasonId) {
      handleQuickStatusUpdate(failReasonId, "unfixable", tempFailReason);
      setShowFailModal(false);
      setFailReasonId(null);
    }
  };

  const startEdit = (repair: Repair) => {
    setEditingId(repair.id);
    const template = ISSUE_CHECKLISTS[repair.issue] || ISSUE_CHECKLISTS["default"];
    const mergedChecklist: Record<string, boolean> = {};
    template.forEach(item => {
      mergedChecklist[item] = repair.checklist?.[item] || false;
    });

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
      checklist: mergedChecklist,
      failureReason: repair.failureReason || ""
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
      checklist: {},
      failureReason: ""
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "in-progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "waiting-parts": return "bg-purple-50 text-purple-700 border-purple-200";
      case "ready": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed": return "bg-slate-50 text-slate-500 border-slate-200 line-through decoration-slate-400";
      case "unfixable": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  // --- FILTERS & SORTING ---
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

  const sortedRepairs = [...filteredRepairs].sort((a, b) => {
    return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
  });

  const getGroupTitle = (dateStr: string) => {
    if (!dateStr) return "Unknown Date";
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dStr = date.toISOString().split('T')[0];
    const tStr = today.toISOString().split('T')[0];
    const yStr = yesterday.toISOString().split('T')[0];

    if (dStr === tStr) return "Today";
    if (dStr === yStr) return "Yesterday";
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const groupedRepairs = sortedRepairs.reduce((groups, repair) => {
    const title = getGroupTitle(repair.dateReceived);
    if (!groups[title]) groups[title] = [];
    groups[title].push(repair);
    return groups;
  }, {} as Record<string, Repair[]>);

  const groupKeys = Object.keys(groupedRepairs).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    const dateA = new Date(groupedRepairs[a][0].dateReceived).getTime();
    const dateB = new Date(groupedRepairs[b][0].dateReceived).getTime();
    return dateB - dateA;
  });

  return (
    <main className="min-h-screen bg-white p-2 md:p-6 text-slate-900 font-sans">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Repairs</h1>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
             {["all", "pending", "in-progress", "ready", "completed", "unfixable"].map((st) => (
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

      {/* --- DESKTOP TABLE WITH BOLD DIVIDERS --- */}
      <div className="hidden md:block overflow-visible border border-slate-200 rounded-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-r border-slate-200 w-14 text-center">ID</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-40">Customer</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-40">Device</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">Issue</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-12 text-center">Check</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-24">Finish</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-28">Status</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-20 text-right">Cost</th>
              <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 w-12 text-center">Act</th>
            </tr>
          </thead>

          {groupKeys.length === 0 ? (
            <tbody>
              <tr><td colSpan={9} className="text-center py-8 text-slate-400 text-sm">No repairs found</td></tr>
            </tbody>
          ) : (
            groupKeys.map(groupTitle => (
              <tbody key={groupTitle}>
                {/* --- HEADER ROW WITH BOLD LINE --- */}
                {/* Notice the border-t-[3px] border-slate-800 */}
                <tr className="bg-slate-50 border-t-[3px] border-slate-800">
                  <td colSpan={9} className="px-3 py-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                       {/* High contrast text */}
                       <span className={`text-xs font-black uppercase tracking-wide flex items-center gap-2 ${
                         groupTitle === "Today" ? "text-blue-700" : "text-slate-900"
                       }`}>
                         <CalendarDays size={14} className={groupTitle === "Today" ? "text-blue-600" : "text-slate-900"} />
                         {groupTitle}
                       </span>
                       <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                         {groupedRepairs[groupTitle].length}
                       </span>
                       {/* Visual Line extending to right */}
                       <div className="h-px bg-slate-300 flex-1 ml-2"></div>
                    </div>
                  </td>
                </tr>

                {/* --- REPAIR ROWS --- */}
                {groupedRepairs[groupTitle].map((repair) => (
                  <tr key={repair.id} className="hover:bg-blue-50/40 group transition-colors bg-white">
                    <td className="px-2 py-1 text-[11px] text-slate-400 font-mono text-center border-r border-slate-100">
                      {repair.id.slice(-4)}
                    </td>
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
                    <td className="px-2 py-1 text-[11px] text-slate-700 font-medium truncate max-w-[150px]">
                      {repair.device}
                    </td>
                    <td className="px-2 py-1 text-[11px] text-slate-600 truncate max-w-[200px]" title={repair.issue}>
                      {repair.issue}
                    </td>
                    <td className="px-2 py-1 text-center relative">
                      <div className="group inline-block cursor-help">
                          <ClipboardList size={14} className={Object.keys(repair.checklist || {}).length > 0 ? "text-blue-500" : "text-slate-300"} />
                          <div className="absolute left-1/2 -translate-x-1/2 top-6 z-50 hidden group-hover:block w-48 p-2 bg-white border border-slate-200 shadow-xl rounded-lg text-left pointer-events-none">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 border-b pb-1">Inspection Results</p>
                            {repair.checklist && Object.keys(repair.checklist).length > 0 ? (
                              Object.entries(repair.checklist).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-0.5">
                                  <span className="text-[10px] text-slate-600 truncate max-w-[120px]">{key}</span>
                                  {value ? <Check size={10} className="text-green-500"/> : <X size={10} className="text-red-400"/>}
                                </div>
                              ))
                            ) : (<span className="text-[10px] text-slate-400">No checklist data</span>)}
                          </div>
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      {repair.estimatedCompletion ? (
                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                          <CalendarClock size={10} className="text-slate-400"/>
                          {repair.estimatedCompletion}
                        </div>
                      ) : (<span className="text-[10px] text-slate-300">-</span>)}
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={repair.status}
                        onChange={(e) => handleQuickStatusChange(repair.id, e.target.value)}
                        className={`appearance-none w-full text-[10px] font-bold uppercase py-0.5 px-2 rounded border ${getStatusStyle(repair.status)} cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">Working</option>
                        <option value="waiting-parts">Parts</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Done</option>
                        <option value="unfixable">Unfixable</option>
                      </select>
                    </td>
                    <td className="px-2 py-1 text-right text-[11px] font-bold text-slate-900">
                      {repair.cost ? `R${repair.cost}` : "-"}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button onClick={() => startEdit(repair)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))
          )}
        </table>
      </div>

      {/* --- MOBILE LIST WITH BOLD DIVIDERS --- */}
      <div className="md:hidden space-y-6">
        {groupKeys.length === 0 ? (
           <p className="text-center text-slate-400 text-xs py-10">No repairs found</p>
        ) : (
          groupKeys.map(groupTitle => (
            <div key={groupTitle}>
              {/* Date Header Mobile - BOLD LINE */}
              <div className="flex items-center gap-2 mb-3 px-1 border-t-[3px] border-slate-800 pt-4">
                <span className={`text-xs font-black uppercase tracking-wide ${
                    groupTitle === "Today" ? "text-blue-700" : "text-slate-900"
                  }`}>
                    {groupTitle}
                </span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                  {groupedRepairs[groupTitle].length}
                </span>
              </div>

              <div className="space-y-2">
                {groupedRepairs[groupTitle].map((repair) => (
                  <div key={repair.id} onClick={() => startEdit(repair)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-xs text-slate-900">{repair.customerName}</h3>
                        <p className="text-[10px] text-slate-500">{repair.device}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase rounded border ${getStatusStyle(repair.status)}`}>
                        {repair.status}
                      </span>
                    </div>
                    {repair.status === 'unfixable' && (
                      <div className="bg-red-50 text-red-800 text-[10px] p-1.5 rounded mt-1 border border-red-100 flex gap-1">
                        <AlertOctagon size={12}/> {repair.failureReason || "No reason provided"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODALS (Unchanged) --- */}
      {(showAddModal || editingId) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {editingId ? "Edit Repair" : "New Repair Intake"}
              </h2>
              <button onClick={closeModal}><X size={18} className="text-slate-400 hover:text-red-500" /></button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <User size={10} /> Customer Name
                  </label>
                  <input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="082 123 4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Device Model</label>
                   <input
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="iPhone 14 Pro"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Issue Category</label>
                   <select
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {REPAIR_ISSUES.map((issue) => (
                      <option key={issue} value={issue}>{issue}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ClipboardList size={12} /> Pre-Repair Checklist
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(formData.checklist).map((checkItem) => (
                    <label 
                      key={checkItem} 
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all select-none ${formData.checklist[checkItem] ? "bg-green-50 border-green-200 text-green-800 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${formData.checklist[checkItem] ? "bg-green-500 border-green-500" : "bg-white border-slate-300"}`}>
                        {formData.checklist[checkItem] && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.checklist[checkItem]}
                        onChange={() => toggleChecklist(checkItem)}
                        className="hidden"
                      />
                      <span className="text-[11px] font-medium leading-tight">{checkItem}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="waiting-parts">Waiting Parts</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="unfixable">Unable to Fix</option>
                    </select>
                 </div>
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
              </div>
              {formData.status === "unfixable" && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <label className="text-[10px] uppercase font-bold text-red-600 flex items-center gap-1 mb-1">
                    <AlertOctagon size={12} /> Reason for Failure
                  </label>
                  <textarea
                    value={formData.failureReason}
                    onChange={(e) => setFormData({ ...formData, failureReason: e.target.value })}
                    rows={2}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 outline-none resize-none bg-white text-red-900 placeholder-red-300"
                    placeholder="Why couldn't this device be fixed?"
                  />
                </div>
              )}
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
                className="flex-1 px-4 py-2.5 text-xs font-bold uppercase text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => editingId ? handleUpdateRepair(editingId) : handleAddRepair()}
                disabled={loading || (formData.status === 'unfixable' && !formData.failureReason)}
                className="flex-1 px-4 py-2.5 text-xs font-bold uppercase text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {editingId ? "Save Changes" : "Create Repair"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
              <AlertOctagon /> Mark as Unfixable
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason why this device could not be repaired. This will be saved to the repair record.
            </p>
            <textarea
              value={tempFailReason}
              onChange={(e) => setTempFailReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"
              rows={3}
              placeholder="e.g. Motherboard dead, parts unavailable..."
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setShowFailModal(false); setFailReasonId(null); }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={submitFailReason}
                disabled={!tempFailReason.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                Confirm Failure
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
