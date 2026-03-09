import type { Metadata } from "next";
import "./globals.css";

import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Log Analytics Dashboard",
  description: "Interactive analytics UI for log pipeline metrics",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-[1600px] gap-3 p-3 pb-24 md:pb-3">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Navbar />
              <main className="min-h-[calc(100vh-6rem)]">{children}</main>
            </div>
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}