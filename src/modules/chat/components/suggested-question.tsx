interface Props {
  question: string;
}

export function SuggestedQuestion({
  question,
}: Props) {
  return (
    <button
      className="
      w-full
      rounded-xl
      border
      px-4
      py-3
      text-left
      text-sm
      hover:bg-muted
      transition
      "
    >
      {question}
    </button>
  );
}