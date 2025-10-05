"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section id="HeroSection" className="relative bg-gradient-to-b from-[#0a0f2f] to-[#1b2a5b] text-white text-center px-6 py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          วางแผนการเงินให้ชีวิตมั่นคง
        </h1>
        <p className="text-lg mb-8">
          คำนวณภาษี วางแผนเกษียณ ออมเงิน และอ่านบทความการเงินที่เข้าใจง่าย
          ทุกอย่างในที่เดียว
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="#Feature"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById("Feature");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white hover:bg-black hover:text-white text-black font-semibold py-3 px-8 rounded-full transition"
          >
            เริ่มคำนวณเลย
          </Link>
          <Link
            href="/Components/article"
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-full transition"
          >
            อ่านข่าว
          </Link>
        </div>
      </div>
    </section>
  );
}
