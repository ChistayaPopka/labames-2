import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://fedor-lavshonok.bouncykid4.chatgpt.site"),
  title: "Федор Лавшонок — студент ДВФУ",
  description: "Привет! Я Федор Лавшонок, мне 19 лет. Учусь в ДВФУ, в группе 01.03.02сп. Это мой личный сайт с небольшой игрой.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#f7f6f2" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru" id="top"><body><a className="skip-link" href="#main">Перейти к содержимому</a>{children}</body></html>;
}
