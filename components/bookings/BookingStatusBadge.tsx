export default function BookingStatusBadge({
  status,
}: {
  status: string
}) {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    "Checked-in": "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-gray-100 text-gray-700",
    "No-show": "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium
        ${styles[status] || "bg-muted text-muted-foreground"}
      `}
    >
      {status}
    </span>
  )
}
