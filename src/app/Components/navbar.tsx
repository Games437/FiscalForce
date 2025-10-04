"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-gray-900 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Link href="/">Fiscal Force</Link>
          </div>
          <nav className="space-x-6 text-white font-medium">
            <Link href="/Components/tax" className="hover:text-yellow-400">
              tax
            </Link>
            <Link href="/Components/retirement" className="hover:text-yellow-400">
              วางแผนเกษียณ
            </Link>
            <Link href="/Components/saving" className="hover:text-yellow-400">
              คำนวณการออม
            </Link>
            <Link href="/Components/editorial" className="hover:text-yellow-400">
              บทความ
            </Link>
          </nav>
        </div>
      </header>
  );
}