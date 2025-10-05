"use client";
import Link from "next/link";
import Navbar from "./Components/navbar";
import Footer from "./Components/footer";
import Article from "./Components/article/page";

export default function MyTaxPage() {

  return (
    <div className="bg-[#f6fcff] min-h-screen flex flex-col font-sans">
      {/* ✅ Navbar */}
      <Navbar />

      {/* 🌈 Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0a0f2f] to-[#1b2a5b] text-white text-center px-6 py-24 overflow-hidden">
        <div className="max-w-4xl mx-auto">
<h1 className="text-5xl font-extrabold mb-4 leading-tight">
      วางแผนการเงินให้ชีวิตมั่นคง
    </h1>
    <p className="text-lg mb-8">
      คำนวณภาษี วางแผนเกษียณ ออมเงิน และอ่านบทความการเงินที่เข้าใจง่าย  
      ทุกอย่างในที่เดียว — สำหรับคนไทยโดยเฉพาะ
    </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link
        href="#calculators"
        className="bg-white hover:bg-black hover:text-white text-black font-semibold py-3 px-8 rounded-full transition"
      >
        เริ่มคำนวณเลย
      </Link>
      <Link
        href="/articles"
        className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-full transition"
      >
        อ่านบทความ
      </Link>
    </div>
        </div>
      </section>

{/* 🔹 หัวข้อของ Feature Section */}
<div className="text-center mt-24">
  <h2 className="text-3xl font-bold mb-4 text-gray-900">
    เครื่องมือคำนวณทางการเงินครบวงจร
  </h2>
  <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
    คำนวณภาษี วางแผนเกษียณ และออมเงินได้ง่าย ๆ ภายในไม่กี่คลิก
  </p>
</div>

{/* 🔹 Feature Section */}
<section className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 mt-8 mb-20">
  <Link
    href="/Components/tax"
    className="bg-white rounded-2xl shadow-xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
  >
    <div className="text-5xl mb-4 text-green-700">🧾</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">คำนวณภาษี</h3>
    <p className="text-gray-600">คำนวณภาษีรายได้บุคคลธรรมดาแบบอัตโนมัติ เข้าใจง่าย</p>
  </Link>

  <Link
    href="/Components/retirement"
    className="bg-white rounded-2xl shadow-xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
  >
    <div className="text-5xl mb-4 text-green-700">📈</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">วางแผนเกษียณ</h3>
    <p className="text-gray-600">คำนวณเงินที่ต้องใช้หลังเกษียณ ปรับตามอัตราเงินเฟ้อ</p>
  </Link>

  <Link
    href="/Components/saving"
    className="bg-white rounded-2xl shadow-xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
  >
    <div className="text-5xl mb-4 text-green-700">💰</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">คำนวณการออม</h3>
    <p className="text-gray-600">จำลองการออมและลงทุน พร้อมกราฟแสดงผลการเติบโต</p>
  </Link>

  <a
    href="#articles"
    className="bg-white rounded-2xl shadow-xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
  >
    <div className="text-5xl mb-4 text-green-700">📰</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">บทความการเงิน</h3>
    <p className="text-gray-600">
      เรียนรู้เรื่องภาษี เงินเฟ้อ และการวางแผนการเงินในชีวิตจริง
    </p>
  </a>
</section>


      {/* 📰 บทความล่าสุด */}
      <Article/>

      {/* 🚀 CTA Section */}
      <section className="bg-gradient-to-b from-[#0a0f2f] to-[#1b2a5b] text-white py-16 text-center">
  <div className="max-w-3xl mx-auto px-4">
    <h2 className="text-3xl font-bold mb-4">พร้อมวางแผนอนาคตทางการเงินของคุณหรือยัง?</h2>
    <p className="text-lg mb-8">
      เริ่มคำนวณภาษี วางแผนเกษียณ และออมเงินอย่างมีระบบ  
      พร้อมอ่านบทความการเงินที่ช่วยให้คุณเข้าใจและตัดสินใจได้ดีขึ้น
    </p>
    <Link
      href="#calculators"
      className="bg-white hover:bg-black hover:text-white text-black font-semibold py-3 px-8 rounded-full transition"
    >
      เริ่มต้นวางแผนการเงิน
    </Link>
  </div>
</section>

      {/* 🦶 Footer */}
      <Footer />
    </div>
  );
}
