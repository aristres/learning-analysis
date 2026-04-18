'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#1B2A4A]">
            <span className="text-[#F7941D]">Manabi</span> Compass
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/parent/assessment/free"
            className="text-sm font-medium text-[#1B2A4A] hover:text-[#F7941D] transition"
          >
            無料診断
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full border border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white transition"
          >
            ログイン
          </Link>
        </nav>
      </div>
    </header>
  )
}
