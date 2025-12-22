export default function GeneralSettings() {
  return (
    <div className="space-y-8">
      <Header
        title="General Settings"
        description="Basic business and system preferences"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Business Name" placeholder="Repair Pro" />
        <Field label="Support Email" placeholder="support@repairpro.com" />
        <Field label="Phone Number" placeholder="+1 234 567 890" />
        <Field label="Timezone" placeholder="UTC" />
        <Field label="Currency" placeholder="USD" />
        <Field label="Working Hours" placeholder="09:00 - 18:00" />
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

function Field({ label, placeholder }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
      />
    </div>
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
