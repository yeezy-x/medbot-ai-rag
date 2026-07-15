export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
      {children}
    </main>
  );
}