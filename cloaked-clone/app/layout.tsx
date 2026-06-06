import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shielded - Ultimate Privacy Protection",
  description:
    "Shielded automatically removes your personal data from 200+ data broker sites, provides virtual phone numbers, email aliases, and stops spam — protecting your privacy 24/7.",
  keywords: [
    "privacy protection",
    "data broker removal",
    "virtual phone numbers",
    "email aliases",
    "spam blocking",
    "data removal",
    "personal data protection",
    "identity protection",
  ],
  authors: [{ name: "Shielded Privacy" }],
  creator: "Shielded Privacy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shielded.app",
    title: "Shielded - Ultimate Privacy Protection",
    description:
      "Remove your data from 200+ data brokers automatically. Virtual numbers, email aliases, spam blocking.",
    siteName: "Shielded",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shielded - Ultimate Privacy Protection",
    description: "Remove your data from 200+ data brokers automatically.",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
