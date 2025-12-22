import RepairsHeader from "@/components/repairs/RepairsHeader"
import RepairsTable from "@/components/repairs/RepairsTable"

export default function RepairsPage() {
  return (
    <div className="space-y-6">
      <RepairsHeader />
      <RepairsTable />
    </div>
  )
}
