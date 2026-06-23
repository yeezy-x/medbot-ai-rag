interface Props {
  role: string;
  content: string;
}

export function MessageItem({
  role,
  content,
}: Props) {
  const isUser =
    role === "USER";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className="
          max-w-3xl
          rounded-lg
          p-4
          border
        "
      >
        {content}
      </div>
    </div>
  );
}