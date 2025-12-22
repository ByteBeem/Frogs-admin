import BookingsHeader from "@/components/bookings/BookingsHeader"
import BookingsTable from "@/components/bookings/BookingsTable"

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <BookingsHeader />
      <BookingsTable />
    </div>
  )
}
