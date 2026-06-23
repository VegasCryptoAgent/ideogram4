import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Shield - Fight Back Against Surveillance, Spam & Identity Theft",
  description:
    "Shield finds and removes your personal data from 200+ data broker sites, gives you virtual phone numbers and email aliases, and stops spam — automatically.",
  keywords: [
    "privacy protection",
    "data broker removal",
    "virtual phone numbers",
    "email aliases",
    "spam blocking",
    "identity theft protection",
    "data removal",
  ],
  authors: [{ name: "Shield Privacy" }],
  creator: "Shield Privacy",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Shield - Fight Back Against Surveillance, Spam & Identity Theft",
    description:
      "Remove your data from 200+ data brokers automatically. Virtual numbers, email aliases, breach alerts.",
    siteName: "Shield",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shield - Privacy Protection",
    description: "Remove your data from 200+ data brokers automatically.",
  },
  robots: { index: true, follow: true },
  themeColor: "#F97316",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
