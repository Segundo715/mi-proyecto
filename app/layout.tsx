import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FeatureGuard from "@/app/components/FeatureGuard";
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
  title: "Chubis",
  description: "Tarjeta de fidelización Chubis — acumula 5 visitas y gana un café gratis",
};

// Evita el auto-zoom del navegador al enfocar inputs en móvil.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <FeatureGuard />{children}
      </body>
    </html>
  );
}
