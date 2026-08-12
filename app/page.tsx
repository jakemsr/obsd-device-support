import { Suspense } from "react";
import SearchFields from "./components/SearchFields";
import SearchFieldsSkeleton from "./components/SearchFieldsSkeleton";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-svh flex flex-col items-center justify-center">
      <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-8 font-sans">
        OpenBSD Device Support Database
      </h1>

      <Suspense fallback={<SearchFieldsSkeleton />}>
        <SearchFields />
      </Suspense>

      <div className="mt-4 text-sm sm:text-base text-center">
        <Link
          href="/docs/how_this_works"
          className="text-link hover:underline"
        >
          How this works
        </Link>
      </div>
    </div>
  );
}
