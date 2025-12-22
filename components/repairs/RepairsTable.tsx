import StatusBadge from "./StatusBadge"

const repairs = [
  {
    id: "R-1023",
    customer: "John Doe",
    device: "iPhone 13",
    status: "Repairing",
    updated: "2 hours ago",
  },
  {
    id: "R-1024",
    customer: "Sarah K.",
    device: "Samsung S22",
    status: "Received",
    updated: "1 day ago",
  },
  {
    id: "R-1025",
    customer: "Mike T.",
    device: "iPhone 11",
    status: "Ready",
    updated: "3 days ago",
  },
]

export default function RepairsTable() {
  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <table className="w-full text-sm hidden md:table">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left p-3">Repair ID</th>
            <th className="text-left p-3">Customer</th>
            <th className="text-left p-3">Device</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Last Update</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {repairs.map(r => (
            <tr
              key={r.id}
              className="border-t hover:bg-muted/50"
            >
              <td className="p-3 font-medium">{r.id}</td>
              <td className="p-3">{r.customer}</td>
              <td className="p-3">{r.device}</td>
              <td className="p-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="p-3 text-muted-foreground">
                {r.updated}
              </td>
              <td className="p-3 text-right">
                <button className="text-sm font-medium hover:underline">
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden divide-y">
        {repairs.map(r => (
          <div key={r.id} className="p-4 space-y-2">
            <div className="flex justify-between">
              <div className="font-medium">{r.device}</div>
              <StatusBadge status={r.status} />
            </div>

            <div className="text-sm text-muted-foreground">
              {r.customer} • {r.id}
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Updated {r.updated}
              </span>
              <button className="font-medium">Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
