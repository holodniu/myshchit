import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://myshchit.ru"),
  title: {
    default: "Мой Щит — Конструктор электрощитов онлайн",
    template: "%s | Мой Щит",
  },
  description:
    "Соберите электрощит за 5 минут. Автоматический подбор автоматов, УЗО, кабелей. Расчёт нагрузки, визуализация щита, PDF-проект. Бренды ABB, Schneider, IEK.",
  keywords: [
    "электрощит",
    "конструктор электрощита",
    "расчёт электрощита",
    "автоматический выключатель",
    "УЗО",
    "дифавтомат",
    "ПУЭ",
    "кабель ВВГнг",
    "схема электрощита",
    "ABB",
    "Schneider Electric",
    "IEK",
  ],
  authors: [{ name: "МОЙ ЩИТ", url: "https://myshchit.ru" }],
  creator: "МОЙ ЩИТ",
  publisher: "МОЙ ЩИТ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Мой Щит — Конструктор электрощитов",
    description:
      "Соберите электрощит за 5 минут с автоматическим подбором оборудования",
    url: "https://myshchit.ru",
    siteName: "МОЙ ЩИТ",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Мой Щит — Конструктор электрощитов",
    description: "Соберите электрощит за 5 минут",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://myshchit.ru",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}

