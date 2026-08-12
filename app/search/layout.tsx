import Link from "next/link";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="flex justify-between items-center text-sm sm:text-base bg-gray-100 dark:bg-gray-900 p-4">
        <Link href="/" className="text-link hover:underline">Home</Link>
        <span className="text-center">OpenBSD Device Support Database</span>
        <Link href="/login" className="text-link cursor-not-allowed pointer-events-none">Login</Link>
      </div>

      <section className="w-full">
        {children}
      </section>
    </div>
  );
}
