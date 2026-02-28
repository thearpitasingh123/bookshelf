import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookShelf",
  description: "Your reading life, beautifully organised.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0D0D0D] text-white">
        <div className="flex min-h-screen">
          
          {/* Sidebar */}
          <aside className="w-64 bg-[#1A1A2E] flex flex-col p-6 fixed h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-[#C9A84C]">BookShelf</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
              <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#C9A84C] bg-[#C9A84C22] font-semibold">
                <span>📖</span> Library
              </a>
              <a href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#888888] hover:text-white hover:bg-[#ffffff11] transition-colors">
                <span>🔖</span> Wishlist
              </a>
              <a href="/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#888888] hover:text-white hover:bg-[#ffffff11] transition-colors">
                <span>✨</span> AI Picks
              </a>
            </nav>

            {/* User profile at bottom */}
            <div className="flex items-center gap-3 pt-6 border-t border-[#ffffff11]">
              <div className="w-9 h-9 rounded-full bg-[#C9A84C] flex items-center justify-center text-black font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Arpita Singh</p>
                <p className="text-[#888888] text-xs">View Profile</p>
              </div>
            </div>
          </aside>

          {/* Main content - pushed right of sidebar */}
          <main className="ml-64 flex-1 p-8">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}