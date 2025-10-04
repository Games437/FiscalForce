"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
            <span>🟢</span> วางแผนการเงิน
          </div>
          <nav className="space-x-6 text-gray-700 font-medium">
            <Link href="/Components/retirement" className="hover:text-green-700">
              tax
            </Link>
            <Link href="/Components/retirement" className="hover:text-green-700">
              วางแผนเกษียณ
            </Link>
            <Link href="/Components/saving" className="hover:text-green-700">
              คำนวณการออม
            </Link>
            <a href="#articles" className="hover:text-green-700">
              บทความ
            </a>
          </nav>
        </div>
      </header>
  );
}