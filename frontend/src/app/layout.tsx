import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AssistantDrawer } from "@/components/agent/AssistantDrawer";

export const metadata: Metadata = {
  title: "UrjaKavach | Stainless Steel Carbon & Energy Decarbonization Platform",
  description:
    "UrjaKavach — High-precision pyrometallurgical carbon & energy decision platform. 43 grades, closed-loop mass balance, dynamic enthalpy, EU CBAM & India CCTS statutory optimization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian-950 text-steel-100 flex flex-col antialiased selection:bg-thermal-500/30 selection:text-thermal-300 font-sans">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <AssistantDrawer />
      </body>
    </html>
  );
}
