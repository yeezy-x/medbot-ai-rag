export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="MedBot is thinking">
      <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.3s]" />
      <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.15s]" />
      <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
    </div>
  );
}
