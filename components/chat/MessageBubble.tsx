import clsx from "clsx";

export default function MessageBubble({
  sender,
  text,
  created_at,
}: {
  sender: "admin" | "visitor";
  text: string;
  created_at?: string;
}) {
  const isAdmin = sender === "admin";

  return (
    <div
      className={clsx(
        "max-w-xs md:max-w-md px-4 py-2 rounded-xl text-sm break-words",
        isAdmin
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-white border"
      )}
    >
      <div>{text}</div>

      {created_at && (
        <div className="text-xs opacity-70 mt-1 text-right">
          {new Date(created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}
