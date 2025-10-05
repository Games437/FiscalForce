"use client";
import Link from "next/link";

export default function FeatureSection() {
  const features = [
    {
      href: "/Components/tax",
      icon: "🧾",
      title: "คำนวณภาษี",
      desc: "คำนวณภาษีรายได้บุคคลธรรมดาแบบอัตโนมัติ เข้าใจง่าย",
    },
    {
      href: "/Components/retirement",
      icon: "📈",
      title: "วางแผนเกษียณ",
      desc: "คำนวณเงินที่ต้องใช้หลังเกษียณ ปรับตามอัตราเงินเฟ้อ",
    },
    {
      href: "/Components/saving",
      icon: "💰",
      title: "คำนวณเงินออม",
      desc: "จำลองการออมและลงทุน พร้อมกราฟแสดงผลการเติบโต",
    },
    {
      href: "/Components/article",
      icon: "📰",
      title: "ข่าวการเงิน",
      desc: "ติดตามข่าวสารและบทความการเงินที่น่าสนใจ อัพเดททุกสัปดาห์",
    },
  ];

  return (
    <div className="text-center mt-24">
      {/* หัวข้อ */}
      <h2 className="text-3xl font-bold mb-4 text-gray-900">
        เครื่องมือคำนวณทางการเงินครบวงจร
      </h2>
      <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
        คำนวณภาษี วางแผนเกษียณ และออมเงินได้ง่าย ๆ ภายในไม่กี่คลิก
      </p>

      {/* รายการเครื่องมือ */}
      <section id="Feature" className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 mt-8 mb-20">
        {features.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="bg-white rounded-2xl shadow-xl p-8 text-center 
                       hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-5xl mb-4 text-green-700">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
