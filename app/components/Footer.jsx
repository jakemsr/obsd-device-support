import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto w-full grid grid-cols-3 px-8 py-4 text-sm sm:text-base">
      <div className="flex items-center justify-start">
        &copy; {new Date().getFullYear()}&nbsp;
        <Link
          href="mailto:jake@jakemsr.dev"
          className="text-link hover:underline"
        >
          Jacob Meuser
        </Link>
      </div>
      <div className="flex items-center justify-center">
        <Link
          href="/docs/how_this_works"
          className="text-link hover:underline"
        >
          How this works
        </Link>
      </div>
      <div className="flex items-center justify-end">
        <Link
          href="https://github.com/jakemsr/obsd-device-support"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:underline"
        >
          GitHub repo
        </Link>
      </div>
    </footer>
  )
}