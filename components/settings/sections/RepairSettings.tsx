export default function RepairSettings() {
  return (
    <div className="space-y-8">
      <Header
        title="Repair Workflow"
        description="Control how repairs move through your system"
      />

      <div className="space-y-4">
        <SettingRow
          title="Default Repair Duration"
          description="Used to estimate completion time"
        >
          <input className="input" placeholder="2 days" />
        </SettingRow>

        <SettingRow
          title="Auto-assign Technician"
          description="Automatically assign new repairs"
        >
          <Toggle />
        </SettingRow>

        <SettingRow
          title="Allow customer tracking"
          description="Customers can view repair status"
        >
          <Toggle checked />
        </SettingRow>
      </div>

      <div>
        <h3 className="font-medium mb-3">Repair Status Flow</h3>
        <div className="flex flex-wrap gap-2">
          {["Received", "Diagnosing", "Repairing", "Ready", "Completed"].map(
            s => (
              <span
                key={s}
                className="px-3 py-1 rounded-full text-xs border bg-muted"
              >
                {s}
              </span>
            )
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Header({ title, description }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function SettingRow({ title, description, children }: any) {
  return (
    <div className="flex items-center justify-between gap-4 border rounded-lg p-4">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked = false }: { checked?: boolean }) {
  return (
    <button
      className={`w-12 h-6 rounded-full relative transition
      ${checked ? "bg-black" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition
        ${checked ? "right-1" : "left-1"}`}
      />
    </button>
  )
}

function Footer() {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <button className="px-4 py-2 text-sm rounded-md border">
        Cancel
      </button>
      <button className="px-4 py-2 text-sm rounded-md bg-black text-white">
        Save Changes
      </button>
    </div>
  )
}
