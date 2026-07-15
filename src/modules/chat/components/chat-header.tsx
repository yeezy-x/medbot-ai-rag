export function ChatHeader() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6">
      <div>
        <h2 className="font-semibold">
          MedBot
        </h2>

        <p className="text-xs text-muted-foreground">
          Gale Encyclopedia of Medicine · GPT-4o
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className="size-2 rounded-full bg-green-500" />
        Online
      </div>
    </header>
  );
}