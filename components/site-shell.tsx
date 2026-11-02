import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteHeader({ play = false }: { play?: boolean }) {
  return <header className="site-header wrap"><Link href="/" className="wordmark" aria-label="Федор Лавшонок — на главную">ф<span>.</span></Link><nav aria-label="Основная навигация"><Link href="/" aria-current={!play ? "page" : undefined}>Обо мне</Link><Link href="/play/" className={play ? "nav-play active" : "nav-play"} aria-current={play ? "page" : undefined}>Играть <ArrowUpRight size={16} aria-hidden="true" /></Link></nav></header>;
}

export function SiteFooter() {
  return <footer className="site-footer wrap"><Link href="/" className="footer-name">Федор Лавшонок</Link><a href="#top" className="back-top">Наверх ↑</a></footer>;
}
