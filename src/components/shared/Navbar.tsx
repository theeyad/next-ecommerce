import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="text-xl font-bold">My Store</div>

      <nav className="flex items-center gap-4">
        <>
          <Link href="/login" className="text-sm hover:underline">
            Login
          </Link>
          <Link href="/register" className="text-sm hover:underline">
            Register
          </Link>
        </>
      </nav>
    </header>
  );
}
