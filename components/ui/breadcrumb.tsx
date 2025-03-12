"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  return (
    <nav className="text-sm text-black font-light mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/admin" className="text-black hover:underline">
            Lucero Admin Dashboard
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = "/admin/" + paths.slice(1, index + 1).join("/");
          const isLast = index === paths.length - 1;

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-black">{decodeURIComponent(path)}</span>
              ) : (
                <Link href={href} className="text-gray-500 hover:underline">
                  {decodeURIComponent(path)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
