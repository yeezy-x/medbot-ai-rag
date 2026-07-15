type MessageRole =
  | "USER"
  | "ASSISTANT"
  | "SYSTEM";

interface Props {
  role: MessageRole;
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
        className={`max-w-3xl ${
          isUser
            ? "items-end"
            : "items-start"
        } flex flex-col`}
      >
        <div
          className="
          mb-2
          text-xs
          font-medium
          text-muted-foreground
          "
        >
          {isUser
            ? "You"
            : "MedBot"}
        </div>

        <div
          className={`
            rounded-2xl
            px-4
            py-3
            whitespace-pre-wrap
            ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }
          `}
        >
          {content}
        </div>
      </div>
    </div>
  );
}