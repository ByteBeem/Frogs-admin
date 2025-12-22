import { Plus, Search, Calendar } from "lucide-react"

export default function BookingsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer appointments and walk-ins
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search bookings…"
            className="pl-9 pr-3 py-2 rounded-md border text-sm"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            className="pl-9 pr-3 py-2 rounded-md border text-sm"
          />
        </div>

        <select className="border rounded-md px-3 py-2 text-sm">
          <option>All statuses</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Checked-in</option>
          <option>Cancelled</option>
          <option>No-show</option>
        </select>

        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm">
          <Plus size={16} />
          New Booking
        </button>
      </div>
    </div>
  )
}
