"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard, MdHome, MdLibraryBooks, MdEditNote, MdOutlineSettings } from "react-icons/md";
import { HiOutlineServer } from "react-icons/hi";

const links = [
  { href: "/", label: "Home", icon: MdHome },
  { href: "/post-csr", label: "Post CSR", icon: MdLibraryBooks },
  { href: "/post-ssr", label: "Post SSR", icon: HiOutlineServer },
  { href: "/(edit)", label: "Editor", icon: MdEditNote },
  { href: "/admin", label: "Admin", icon: MdDashboard },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-[#0d101820] backdrop-blur-sm sticky top-0 h-screen">
      <div className="h-16 shrink-0 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-5">
        <Link href="/" className="text-2xl font-extrabold tracking-wide">
          <span className="text-black dark:text-white">EFIC</span>
          <span className="text-emerald-600">SY</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="px-2 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href || (l.href === "/(edit)" && pathname === "/");
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="truncate">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
        <div className="flex items-center justify-between">
          <span>v0.1 · Next TipTap Admin</span>
          <Link href="/admin" className="underline underline-offset-2">Go to Admin</Link>
        </div>
      </div>
    </aside>
  );
}
