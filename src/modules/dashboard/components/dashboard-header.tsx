// src/modules/dashboard/components/dashboard-header.tsx

interface Props {
  name: string;
}

export function DashboardHeader({
  name,
}: Props) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">
        Welcome back, {name}
      </h1>

      <p className="text-muted-foreground">
        Continue your medical research conversations.
      </p>
    </div>
  );
}