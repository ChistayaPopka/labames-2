import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { SlotMachine } from "@/components/slot-machine";

export const metadata: Metadata = { title: "Играть — Федор Лавшонок", description: "Фруктовый автомат: три барабана, случайные символы и никакой игры на деньги." };

export default function PlayPage() {
  return <><SiteHeader play /><main id="main" className="game-page wrap"><Link href="/" className="text-link back-link"><ArrowLeft size={17} aria-hidden="true" /> На главную</Link><div className="game-heading"><h1>Дело случая<span>.</span></h1><p>Игра без денег и ставок.</p></div><SlotMachine /></main><SiteFooter /></>;
}
