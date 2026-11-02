"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCw, Square, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { drawCombination, evaluateCombination, symbols, type Combination } from "@/lib/game";

const trackSymbols = Array.from({ length: 42 }, (_, index) => symbols[index % symbols.length]);
const copy = { triple: "Три одинаковых символа", pair: "Два одинаковых символа", different: "Разные символы" };

export function SlotMachine() {
  const [result, setResult] = useState<Combination>([0, 1, 2]);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<Combination[]>([]);
  const [rounds, setRounds] = useState(0);
  const [matches, setMatches] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const animations = useRef<Animation[]>([]);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; animations.current.forEach((animation) => animation.cancel()); }; }, []);

  async function spin(withAnimation = true) {
    if (busy.current) { animations.current.forEach((animation) => { try { animation.finish(); } catch { /* Already stopped. */ } }); return; }
    busy.current = true;
    setSpinning(true);
    setError(null);
    const running: Animation[] = [];
    try {
      const next = drawCombination();
      // Motion is an explicit user action. The adjacent instant-result control
      // remains available when system preferences or comfort call for no motion.
      if (withAnimation) {
        tracks.current.forEach((track, reel) => {
          if (!track) return;
          const end = 24 + reel * 6 + next[reel];
          const animation = track.animate([{ transform: `translateY(-${result[reel] / 42 * 100}%)` }, { transform: `translateY(-${end / 42 * 100}%)` }], { duration: 2000 + reel * 400, easing: "cubic-bezier(0.12, 0.65, 0.18, 1)", fill: "forwards" });
          running.push(animation);
        });
        animations.current = running;
        await Promise.all(running.map((animation) => animation.finished));
      }
      if (!mounted.current) return;
      tracks.current.forEach((track, reel) => { if (track) track.style.transform = `translateY(-${next[reel] / 42 * 100}%)`; });
      running.forEach((animation) => animation.cancel());
      setResult(next);
      setHistory((previous) => [next, ...previous].slice(0, 5));
      setRounds((previous) => previous + 1);
      if (evaluateCombination(next) !== "different") setMatches((previous) => previous + 1);
    } catch {
      running.forEach((animation) => animation.cancel());
      if (mounted.current) {
        setError("Не удалось запустить прокрутку. Обновите страницу или выберите «Без анимации».");
      }
    }
    finally { busy.current = false; animations.current = []; if (mounted.current) setSpinning(false); }
  }
  const outcome = evaluateCombination(result);
  const message = spinning ? "Барабаны крутятся…" : rounds ? copy[outcome] : "Готово к вращению";
  return <div className="game-layout"><section className="machine" aria-label="Фруктовый игровой автомат"><div className="reel-housing"><div className="payline-marker left" aria-hidden="true" /><div className="reels" aria-hidden="true">{result.map((value, reel) => <div className="reel" key={reel}><div className="reel-track" ref={(element) => { tracks.current[reel] = element; }} style={{ transform: `translateY(-${value / 42 * 100}%)` }}>{trackSymbols.map((symbol, index) => <div className="reel-symbol" key={index}>{symbol.icon}</div>)}</div></div>)}</div><div className="payline-marker right" aria-hidden="true" /></div><div className="result-copy" aria-live="polite" aria-atomic="true"><span className="sr-only">{!spinning && rounds > 0 ? `Результат: ${result.map((value) => symbols[value].name).join(", ")}. ` : ""}</span><h2>{!spinning && rounds > 0 && outcome === "triple" && <Sparkles size={22} aria-hidden="true" />}{message}</h2></div><Button className="spin-button" size="lg" onClick={() => void spin()}>{spinning ? <Square size={18} aria-hidden="true" /> : <RotateCw size={20} aria-hidden="true" />}{spinning ? "Остановить" : "Крутить с анимацией"}<ArrowUpRight size={19} aria-hidden="true" /></Button><button className="instant-result" type="button" onClick={() => void spin(false)} disabled={spinning}>Без анимации</button>{error && <p className="game-error" role="alert">{error}</p>}</section><aside className="game-sidebar"><section className="session-stats"><div><span>Вращений</span><b>{rounds.toLocaleString("ru-RU")}</b></div><div><span>Совпадений</span><b>{matches.toLocaleString("ru-RU")}</b></div></section><section className="history"><h2>Последние вращения <span>↙</span></h2>{history.length === 0 ? <p className="history-empty">Пока нет вращений.</p> : <ol>{history.map((combination, index) => <li key={rounds - index}><span className="history-number">{String(rounds - index).padStart(2, "0")}</span><span aria-label={combination.map((value) => symbols[value].name).join(", ")}>{combination.map((value) => symbols[value].icon).join(" ")}</span><span className={evaluateCombination(combination) !== "different" ? "history-match" : "history-label"}>{evaluateCombination(combination) === "triple" ? "Тройка" : evaluateCombination(combination) === "pair" ? "Пара" : "Микс"}</span></li>)}</ol>}</section><details className="game-rules"><summary>Как это работает?<span aria-hidden="true">+</span></summary><p>Каждый барабан независимо выбирает один из 6 символов. Три одинаковых — тройка, два — пара. Кнопка «Остановить» сразу показывает уже выбранный результат. Игра ничего не списывает и не начисляет; история хранится до ухода со страницы.</p></details></aside></div>;
}
