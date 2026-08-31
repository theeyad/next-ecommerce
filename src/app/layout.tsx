import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SaasflareShell } from "@saasflare/ui";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cartify",
  description: "E-commerce platform for all your needs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <SaasflareShell
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      bodyClassName="min-h-full flex flex-col"
      palette="ocean"
      surface="glass"
      radius="pill"
      iconWeight="duotone"
      theme="light"
      lang="en"
    >
      {children}
    </SaasflareShell>
  );
}
