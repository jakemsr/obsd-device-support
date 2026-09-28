export default function SearchFieldsSkeleton() {
  return (
    <>
      <div className="mt-4 flex flex-col md:flex-row items-center gap-2">
        <div className="w-58 h-10 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-44 h-10 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-44 h-10 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-20 h-10 bg-gray-300 rounded animate-pulse"></div>
      </div>
      <div className="mt-4 w-64 h-6 bg-gray-300 rounded animate-pulse"></div>
    </>
  )
}