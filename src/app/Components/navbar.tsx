"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-gray-900 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Link href="/">Fiscal Force</Link>
          </div>
          <nav className="space-x-6 text-white font-medium">
            <Link href="/Components/tax" className="hover:text-yellow-400">
              คำนวณภาษี
            </Link>
            <Link href="/Components/retirement" className="hover:text-yellow-400">
              วางแผนเกษียณ
            </Link>
            <Link href="/Components/saving" className="hover:text-yellow-400">
              คำนวณเงินออม
            </Link>
            <Link href="/Components/article" className="hover:text-yellow-400">
              ข่าว
            </Link>
          </nav>
        </div>
      </header>
  );
}