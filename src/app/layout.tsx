import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthProvider";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "生活進度追蹤",
  description: "記錄每一天，看見自己的成長",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AuthProvider>
          <FirebaseAnalytics />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
