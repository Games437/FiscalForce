"use client"; 
import { useEffect, useState } from "react";

/* ---------- กำหนดชนิดข้อมูล (TypeScript interfaces) ---------- */

// ข้อมูลข่าวที่จะแสดงบนเว็บ
interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
}

// รูปแบบข้อมูลข่าวที่มาจาก API จริง
interface ApiArticle {
  title?: string;
  description?: string;
  link: string;
  image_url?: string;
}

// รูปแบบโครงสร้างผลลัพธ์จาก API ที่อาจต่างกัน
interface ApiResponse {
  results?: ApiArticle[];
  data?: ApiArticle[];
  articles?: ApiArticle[];
}

/* ---------- ฟังก์ชันแปลงข้อมูล API → ให้เป็นรูปแบบที่เราต้องใช้ ---------- */
function extractArticles(data: ApiResponse, prefix: string): Article[] {
  // ดึง list ของข่าวจาก property ที่มีอยู่ใน API (บาง API อาจใช้ชื่อ results, data หรือ articles)
  const list: ApiArticle[] = data.results || data.data || data.articles || [];

  // แปลงแต่ละข่าวให้มี id, title, description, url, image ตาม type ของเรา
  return list.map((a, i) => ({
    id: `${prefix}-${i}`,
    title: a.title || "ไม่มีหัวข้อ", // ถ้าไม่มีหัวข้อจะใส่ข้อความแทน
    description: a.description || "ไม่มีรายละเอียด",
    url: a.link,
    image: a.image_url || "",
  }));
}

/* ---------- หมวดหมู่ข่าว ---------- */
const categories = [
  { key: "tax", label: "เกี่ยวกับภาษี", query: "ภาษี" },
  { key: "finance", label: "เกี่ยวกับการเงิน", query: "การเงิน" },
  { key: "savings", label: "เกี่ยวกับการออมเงิน", query: "ออมเงิน" },
];

/* ---------- Component หลัก ---------- */
export default function ArticleSection() {
  // เก็บข่าวแต่ละหมวดในรูปแบบ object เช่น { tax: [...], finance: [...] }
  const [articlesByCategory, setArticlesByCategory] = useState<
    Record<string, Article[]>
  >({});

  const [loading, setLoading] = useState(true); // state สำหรับสถานะโหลด
  const [activeCategory, setActiveCategory] = useState<string>("tax"); // หมวดที่เลือกอยู่ตอนนี้
  const [showAll, setShowAll] = useState(false); // สลับระหว่างแสดง 6 ข่าวแรก หรือทั้งหมด

  /* ---------- ดึงข่าวจาก API เมื่อ component โหลดครั้งแรก ---------- */
  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);

      try {
        // ดึงข้อมูลทุกหมวดพร้อมกัน (ใช้ Promise.all เพื่อรอพร้อมกัน)
        const results = await Promise.all(
          categories.map(async (cat) => {
            // URL ของ API (ใช้ encodeURIComponent ป้องกันอักษรไทยผิด)
            const url = `https://newsdata.io/api/1/news?apikey=pub_1cfdbf871b114cfdad87d304ed986a85&country=th&q=${encodeURIComponent(
              cat.query
            )}&language=th`;

            // เรียก API
            const res = await fetch(url);
            if (!res.ok) {
              console.error(`Error fetching ${cat.key}:`, res.status);
              return { key: cat.key, articles: [] as Article[] };
            }

            // แปลงข้อมูลเป็น JSON แล้วแปลงให้อยู่ในรูปแบบที่เราต้องใช้
            const data: ApiResponse = await res.json();
            return { key: cat.key, articles: extractArticles(data, cat.key) };
          })
        );

        // รวมผลลัพธ์ทั้งหมดเป็น object เดียว
        const newData: Record<string, Article[]> = {};
        results.forEach(({ key, articles }) => {
          newData[key] = articles;
        });

        // อัปเดต state
        setArticlesByCategory(newData);
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
      } finally {
        setLoading(false); // ปิดสถานะโหลด
      }
    }

    fetchArticles(); // เรียกใช้เมื่อ component mount
  }, []);

  /* ---------- ฟังก์ชัน render ข่าวเป็น grid ---------- */
  const renderGrid = (articles: Article[]) => {
    // ถ้า showAll เป็น false แสดงแค่ 6 ข่าวแรก
    const displayed = showAll ? articles : articles.slice(0, 6);

    return (
      <>
        {/* ส่วนแสดงข่าวแบบ grid 3 คอลัมน์ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition overflow-hidden"
            >
              {/* ส่วนรูปภาพข่าว */}
              <div className="relative h-36 w-full bg-gray-200">
                {article.image ? (
                  /* eslint-disable @next/next/no-img-element */
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  /* eslint-enable @next/next/no-img-element */
                  <div className="flex items-center justify-center text-4xl text-green-700 w-full h-full">
                    📖 {/* ถ้าไม่มีรูปจะแสดงอีโมจิแทน */}
                  </div>
                )}

                {/* พื้นหลัง gradient ด้านล่างรูป + ชื่อข่าว */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-2">
                  <h3 className="text-white text-sm font-semibold line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </div>

              {/* ส่วนเนื้อหา (คำอธิบาย + ปุ่มอ่านต่อ) */}
              <div className="p-3 flex flex-col h-[150px]">
                <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                  {article.description}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 bg-black hover:bg-gray-800 hover:text-white text-white py-1 px-3 rounded-lg text-center text-sm font-medium transition"
                >
                  อ่านต่อ
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* ปุ่มแสดงเพิ่มเติม / ย่อข่าว */}
        {articles.length > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-black hover:bg-gray-800 hover:text-white text-white text-m font-semibold py-3 px-3 rounded-2xl transition"
            >
              {showAll ? "ย่อข่าว" : "เพิ่มเติม"}
            </button>
          </div>
        )}
      </>
    );
  };

  /* ---------- ส่วนแสดงผลหลัก ---------- */
  return (
    <section
      id="articles"
      className="w-full max-w-6xl mx-auto px-6 mb-20 relative"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ข่าวล่าสุด</h2>

      {/* ปุ่มเลือกหมวดข่าว */}
      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key); // เปลี่ยนหมวดที่เลือก
              setShowAll(false); // รีเซ็ตปุ่มเพิ่มเติม
            }}
            className={`py-2 px-4 rounded-lg font-medium transition ${
              activeCategory === cat.key
                ? "bg-black text-white" // ปุ่มที่ถูกเลือก
                : "bg-gray-200 text-gray-700" // ปุ่มอื่น ๆ
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* แสดงสถานะโหลด / ข่าว */}
      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลดข่าว...</p>
      ) : (
        <>
          {articlesByCategory[activeCategory] ? (
            renderGrid(articlesByCategory[activeCategory])
          ) : (
            <p>ไม่พบข่าว</p>
          )}
        </>
      )}
    </section>
  );
}