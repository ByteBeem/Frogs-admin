export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Active Repairs" value="12" />
        <Stat title="Bookings Today" value="8" />
        <Stat title="Open Chats" value="3" />
        <Stat title="Orders" value="21" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Recent Repairs" />
        <Card title="Latest Bookings" />
        <Card title="Open Chats" />
      </div>
    </div>
  )
}

function Stat({ title, value }: any) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function Card({ title }: any) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="font-medium mb-2">{title}</div>
      <div className="text-sm text-muted-foreground">
        Placeholder content
      </div>
    </div>
  )
}
