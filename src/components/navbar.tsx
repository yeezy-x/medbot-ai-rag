import { auth }
from "@/auth";

export async function Navbar() {

  const session =
    await auth();

  return (
    <nav>
      {session?.user ? (
        <div>
          {session.user.name}
        </div>
      ) : (
        <div>
          Login
        </div>
      )}
    </nav>
  );
}