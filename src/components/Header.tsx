"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface NavLabels {
  home: string; global: string; compare: string;
  feed: string; about: string;
}

const defaultNav: NavLabels = {
  home: "Home", global: "Global", compare: "Compare",
  feed: "Feed", about: "About",
};

export default function Header({ lang = "en", nav }: { lang?: string; nav?: NavLabels }) {
  const n = nav || defaultNav;
  const navItems = [
    { path: "", label: n.home },
    { path: "/global", label: n.global },
    { path: "/compare", label: n.compare },
    { path: "/feed", label: n.feed },
    { path: "/about", label: n.about },
  ];
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const otherLang = lang === "en" ? "ko" : "en";
  const switchPath = pathname.replace(`/${lang}`, `/${otherLang}`);

  const navLinks = navItems.map((n) => ({
    href: `/${lang}${n.path}`,
    label: n.label,
  }));

  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur border-b border-navy-lighter">
      <div className="max-w-[1600px] mx-auto px-3">
        <div className="flex items-center justify-between h-10">
          <Link href={`/${lang}`} className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-bold text-white tracking-tight">
              NPS Tracker
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={switchPath}
              className="ml-2 px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-white border border-navy-lighter rounded transition-colors"
            >
              {lang === "en" ? "한국어" : "EN"}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={switchPath}
              className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-white border border-navy-lighter rounded"
            >
              {lang === "en" ? "한국어" : "EN"}
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="p-1.5 text-slate-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden pb-2 space-y-0.5">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
