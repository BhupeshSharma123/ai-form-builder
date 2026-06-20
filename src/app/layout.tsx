import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Form Builder - Create Forms with AI",
  description:
    "Build beautiful forms in seconds with AI. Just describe what you need and let AI create the perfect form for you.",
  keywords: [
    "form builder",
    "AI forms",
    "survey builder",
    "online forms",
    "typeform alternative",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}