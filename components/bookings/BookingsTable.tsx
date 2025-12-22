import BookingStatusBadge from "./BookingStatusBadge"

const bookings = [
  {
    id: "B-2041",
    customer: "Emily R.",
    device: "iPhone 14 Pro",
    date: "Today, 14:30",
    status: "Pending",
  },
  {
    id: "B-2042",
    customer: "Mark T.",
    device: "Samsung S23",
    date: "Tomorrow, 10:00",
    status: "Confirmed",
  },
  {
    id: "B-2043",
    customer: "Alex J.",
    device: "iPhone 11",
    date: "Yesterday, 16:00",
    status: "No-show",
  },
]

export default function BookingsTable() {
  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      {/* Desktop table */}
      <table className="w-full text-sm hidden md:table">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left p-3">Booking ID</th>
            <th className="text-left p-3">Customer</th>
            <th className="text-left p-3">Device</th>
            <th className="text-left p-3">Date & Time</th>
            <th className="text-left p-3">Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b => (
            <tr
              key={b.id}
              className="border-t hover:bg-muted/50"
            >
              <td className="p-3 font-medium">{b.id}</td>
              <td className="p-3">{b.customer}</td>
              <td className="p-3">{b.device}</td>
              <td className="p-3">{b.date}</td>
              <td className="p-3">
                <BookingStatusBadge status={b.status} />
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
        {bookings.map(b => (
          <div key={b.id} className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">{b.device}</div>
              <BookingStatusBadge status={b.status} />
            </div>

            <div className="text-sm text-muted-foreground">
              {b.customer} • {b.id}
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>{b.date}</span>
              <button className="font-medium">Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
