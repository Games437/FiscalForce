"use client";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-b from-[#0a0f2f] to-[#1b2a5b] text-white py-16 text-center">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">
          พร้อมวางแผนอนาคตทางการเงินของคุณหรือยัง?
        </h2>
        <p className="text-lg mb-8">
          เริ่มคำนวณภาษี วางแผนเกษียณ และออมเงินอย่างมีระบบ
          พร้อมอ่านบทความการเงินที่ช่วยให้คุณเข้าใจและตัดสินใจได้ดีขึ้น
        </p>
        <Link
          href="#Feature"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById("Feature");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-white hover:bg-black hover:text-white text-black font-semibold py-3 px-8 rounded-full transition"
        >
          เริ่มต้นวางแผนการเงิน
        </Link>
      </div>
    </section>
  );
}
