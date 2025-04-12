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
  title: "Token Believer Analytics",
  description: "Analyze and understand token holder metrics and engagement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0e] text-[#e2e2e6]`}
      >
        <div className="fixed inset-0 bg-gradient-to-b from-[#0f1729] to-[#0a0a0e] -z-10"></div>
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.15] -z-10"></div>
        <div className="fixed inset-0 bg-[#0a0a0e] [mask-image:radial-gradient(circle,transparent,black_70%)] -z-10"></div>
        
        <header className="border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h1 className="text-xl font-semibold tracking-tight ml-3">Token Believer Dashboard</h1>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              <span>v1.0</span>
            </div>
          </div>
        </header>
        
        <main>{children}</main>
      </body>
    </html>
  );
}