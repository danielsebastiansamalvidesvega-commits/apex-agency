import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APEX — Agency OS | CMO + CTO + Lead Full-Stack",
  description:
    "Agencia digital y equipo técnico senior en un solo sistema. Estrategia, ads, copy, arquitectura y código alineados al crecimiento.",
  keywords: [
    "marketing digital",
    "agencia IA",
    "CTO",
    "full-stack",
    "growth",
    "APEX",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "APEX",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#070709",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070709] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
