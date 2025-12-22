export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Received: "bg-gray-100 text-gray-700",
    Diagnosing: "bg-yellow-100 text-yellow-700",
    Repairing: "bg-blue-100 text-blue-700",
    Ready: "bg-green-100 text-green-700",
    Completed: "bg-emerald-100 text-emerald-700",
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
