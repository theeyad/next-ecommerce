import Link from "next/link";
import { CoolThemeToggle } from "@/components/lightswind/cool-theme-toggle";

export default function CustomerNavbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/">
        <div className="text-xl font-bold">My Store</div>
      </Link>

      <nav className="flex items-center gap-4">
        <>
          <Link href="/login" className="text-sm">
            Login
          </Link>
          <Link href="/register" className="text-sm">
            Register
          </Link>
          <Link href="/admin" className="text-sm">
            Admin
          </Link>
        </>
        <CoolThemeToggle />
      </nav>
    </header>
  );
}
