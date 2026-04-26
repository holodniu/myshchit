import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Подключаем шрифт Inter от Google Fonts
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Мой Щит — Конструктор электрощитов онлайн",
  description:
    "Соберите электрощит за 5 минут. Автоматический подбор автоматов, УЗО, кабелей и визуализация щита.",
  keywords: [
    "электрощит",
    "конструктор электрощита",
    "расчёт электрощита",
    "автомат",
    "УЗО",
    "дифавтомат",
  ],
  authors: [{ name: "MyShchit" }],
  openGraph: {
    title: "Мой Щит — Конструктор электрощитов",
    description: "Соберите электрощит за 5 минут",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
