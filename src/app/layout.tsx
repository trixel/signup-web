import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trixel — Registro de cuenta",
  description:
    "Crea tu cuenta en Trixel. Registro seguro con verificación de identidad y carga de documentos integrada con Cobru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-sans text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
