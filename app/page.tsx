import { Suspense } from "react";
import SearchFields from "./components/SearchFields";
import SearchFieldsSkeleton from "./components/SearchFieldsSkeleton";

export default function Home() {

  return (
    <div className="mt-auto flex flex-col items-center justify-center">
      <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-8 font-sans">
        OpenBSD Device Support Database
      </h1>

      <Suspense fallback={<SearchFieldsSkeleton />}>
        <SearchFields />
      </Suspense>

    </div>
  );
}
