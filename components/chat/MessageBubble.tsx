import clsx from "clsx"

export default function MessageBubble({ sender, text }: any) {
  const isAdmin = sender === "admin"

  return (
    <div
      className={clsx(
        "max-w-md px-4 py-2 rounded-xl text-sm",
        isAdmin
          ? "ml-auto bg-black text-white"
          : "mr-auto bg-background border"
      )}
    >
      {text}
    </div>
  )
}
