import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary, type Locale } from "./dictionaries";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ko" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="min-h-screen bg-navy text-slate-300 flex flex-col">
      <Header lang={lang} nav={dict.nav} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} nav={dict.nav} />
    </div>
  );
}
