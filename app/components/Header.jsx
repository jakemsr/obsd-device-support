import Link from "next/link";

export default function Header() {
  return (
      <header className="w-full grid grid-cols-3 text-sm sm:text-base py-4 px-8">
        <div className="flex items-center justify-start">
          <Link href="/" className="text-link hover:underline">Home</Link>
        </div>
        <div className="flex items-center justify-center">
          <span>OpenBSD Device Support Database</span>
        </div>
        <div className="flex items-center justify-end">
          <Link href="/login" className="text-link cursor-not-allowed pointer-events-none">Login</Link>
        </div>
      </header>
  );
}