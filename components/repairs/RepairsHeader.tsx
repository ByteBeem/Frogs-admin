import { Plus, Search } from "lucide-react"

export default function RepairsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Repairs</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track all repair jobs
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search repairs…"
            className="pl-9 pr-3 py-2 rounded-md border text-sm"
          />
        </div>

        <select className="border rounded-md px-3 py-2 text-sm">
          <option>All statuses</option>
          <option>Received</option>
          <option>Diagnosing</option>
          <option>Repairing</option>
          <option>Ready</option>
          <option>Completed</option>
        </select>

        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm">
          <Plus size={16} />
          New Repair
        </button>
      </div>
    </div>
  )
}
