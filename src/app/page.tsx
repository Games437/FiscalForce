"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Retirement from "./Components/retirement/page";
import Navbar from "./Components/navbar";
import Footer from "./Components/footer";

export default function MyTaxPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch บทความจำลอง
  useEffect(() => {
    async function fetchArticles() {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=8");
      const data = await res.json();
      setArticles(data);
    }
    fetchArticles();
  }, []);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  return (
    <div className="bg-[#f6fcff] min-h-screen flex flex-col font-sans">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
          วางแผนภาษี ออมเงิน และเกษียณง่ายๆ ในเว็บเดียว
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          จัดการภาษีและแผนการเงินของคุณได้ง่ายขึ้น ใช้งานฟรี ไม่ซับซ้อน
        </p>
        <Link
          href="/Components/retirement"
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg text-lg transition"
        >
          เริ่มวางแผนเลย
        </Link>
      </main>

      {/* Features */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mb-16">
        <Link
          href="/Components/retirement"
          className="bg-white rounded-xl shadow-md p-8 text-center hover:-translate-y-1 hover:shadow-lg transition"
        >
          <div className="text-4xl mb-4 text-green-700">📈</div>
          <h3 className="text-xl font-semibold mb-2">วางแผนเกษียณ</h3>
          <p className="text-gray-600">
            คำนวณเงินที่ต้องใช้หลังเกษียณ ปรับตามอัตราเงินเฟ้อ
          </p>
        </Link>

        <Link
          href="/Components/saving"
          className="bg-white rounded-xl shadow-md p-8 text-center hover:-translate-y-1 hover:shadow-lg transition"
        >
          <div className="text-4xl mb-4 text-green-700">💰</div>
          <h3 className="text-xl font-semibold mb-2">คำนวณการออม</h3>
          <p className="text-gray-600">
            จำลองการออมและลงทุน พร้อมกราฟแสดงผลการเติบโต
          </p>
        </Link>

        <a
          href="#articles"
          className="bg-white rounded-xl shadow-md p-8 text-center hover:-translate-y-1 hover:shadow-lg transition"
        >
          <div className="text-4xl mb-4 text-green-700">📰</div>
          <h3 className="text-xl font-semibold mb-2">บทความการเงิน</h3>
          <p className="text-gray-600">
            เรียนรู้เรื่องภาษี เงินเฟ้อ และการวางแผนการเงินในชีวิตจริง
          </p>
        </a>
      </section>

      {/* 🔽 บทความ */}
      <section id="articles" className="w-full max-w-6xl mx-auto px-6 mb-20 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">📌 บทความล่าสุด</h2>
          <a href="#" className="text-green-700 text-sm hover:underline">
            ดูทั้งหมด →
          </a>
        </div>

        {/* ปุ่มเลื่อน */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-green-100 z-10"
        >
          ◀
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-green-100 z-10"
        >
          ▶
        </button>

        {/* กล่องบทความ */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="h-36 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center text-4xl">
                📖
              </div>
              <div className="p-5 flex flex-col h-[200px]">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                  {article.body}
                </p>
                <a
                  href={`/article/${article.id}`}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center text-sm font-medium transition"
                >
                  อ่านต่อ
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

          {/* ส่วนเนื้อหา */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-10">
        {/* Retirement Planner */}
        <div>
          <Retirement />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
