import Link from "next/link";
import { ArrowDown, ArrowUpRight, Asterisk, GraduationCap } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-shell";

export default function Home() {
  return <><SiteHeader /><main id="main">
    <section className="hero wrap" aria-labelledby="intro-title">
      <div className="hero-copy"><h1 id="intro-title">Федор<br /><span>Лавшонок</span><span className="title-dot">.</span></h1><p className="hero-description">Мне 19 лет. Я студент ДВФУ.</p><div className="hero-actions"><Link href="/play/" className="pill-button primary">Играть <ArrowUpRight size={20} aria-hidden="true" /></Link><a href="#about" className="text-link">Чуть больше обо мне <ArrowDown size={17} aria-hidden="true" /></a></div></div>
      <div className="identity-stage" aria-label="Графическая карточка студента Федора Лавшонка"><div className="identity-card"><div className="card-top"><GraduationCap size={24} aria-hidden="true" /><span>СТУДЕНТ<br />ДВФУ</span><ArrowUpRight size={22} aria-hidden="true" /></div><div className="identity-art" aria-hidden="true"><svg viewBox="0 0 300 250" fill="none"><circle cx="150" cy="125" r="80" stroke="currentColor" strokeWidth="2" /><ellipse cx="150" cy="125" rx="130" ry="42" transform="rotate(-35 150 125)" stroke="currentColor" strokeWidth="2" /><ellipse cx="150" cy="125" rx="130" ry="42" transform="rotate(35 150 125)" stroke="currentColor" strokeWidth="2" /><path d="M150 32v186M58 125h184" stroke="currentColor" strokeWidth="1.5" /><circle cx="246" cy="58" r="12" fill="currentColor" /></svg><span>ФЛ</span></div><div className="card-name">Федор<br />Лавшонок <span>↗</span></div><div className="card-bottom"><span>ГРУППА <b>01.03.02сп</b></span><span className="barcode" aria-hidden="true" /></div></div><span className="age-sticker"><b>19</b><span>лет</span></span><Asterisk className="stage-star" size={50} strokeWidth={1.1} aria-hidden="true" /></div>
    </section>
    <section id="about" className="about wrap" aria-labelledby="about-title"><div className="about-content"><h2 id="about-title">Обо мне</h2><p>Я Федор Лавшонок, студент Дальневосточного федерального университета. Учусь в группе <span className="inline-tag">01.03.02сп</span>. Мне 19 лет.</p><dl className="facts"><div><dt>Университет</dt><dd>ДВФУ <GraduationCap size={21} aria-hidden="true" /></dd></div><div><dt>Учебная группа</dt><dd>01.03.02сп</dd></div><div><dt>Возраст</dt><dd>19 лет</dd></div></dl></div></section>
    <section className="play-teaser wrap" aria-label="Игра со слотами">
      <div className="teaser-art" aria-hidden="true"><span className="teaser-asterisk">✳</span><div className="mini-slots"><span>🍒</span><span>🍋</span><span>🍇</span></div><span className="tiny-star">✦</span></div>
      <Link href="/play/" className="pill-button light">Играть <ArrowUpRight size={19} aria-hidden="true" /></Link>
    </section>
  </main><SiteFooter /></>;
}
