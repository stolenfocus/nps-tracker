import Link from "next/link";

interface NavLabels {
  home: string; global: string; compare: string;
  feed: string; about: string;
}

interface FooterLabels {
  disclaimer: string;
  data: string;
}

const defaultNav: NavLabels = {
  home: "Home", global: "Global", compare: "Compare",
  feed: "Feed", about: "About",
};

const defaultDisclaimer: FooterLabels = {
  disclaimer: "Not investment advice",
  data: "Data: SEC EDGAR 13F + DART",
};

export default function Footer({
  lang = "en",
  nav,
  disclaimer,
}: {
  lang?: string;
  nav?: NavLabels;
  disclaimer?: FooterLabels;
}) {
  const n = nav || defaultNav;
  const d = disclaimer || defaultDisclaimer;

  const links = [
    { path: "", label: n.home },
    { path: "/global", label: n.global },
    { path: "/compare", label: n.compare },
    { path: "/feed", label: n.feed },
    { path: "/about", label: n.about },
    { path: "/privacy", label: "Privacy" },
  ];

  return (
    <footer className="border-t border-navy-lighter bg-navy py-3 px-3">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-2">
        <nav className="flex items-center gap-4 text-[10px] text-slate-500">
          {links.map((l) => (
            <Link
              key={l.path}
              href={`/${lang}${l.path}`}
              className="hover:text-slate-300 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-[10px] text-slate-600">
          {d.data} &middot; {d.disclaimer} &middot; &copy;{" "}
          {new Date().getFullYear()} NPS Tracker
        </div>
      </div>
    </footer>
  );
}
