"use client";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
}

interface ApiArticle {
  title?: string;
  description?: string;
  link: string;
  image_url?: string;
}

interface ApiResponse {
  results?: ApiArticle[];
  data?: ApiArticle[];
  articles?: ApiArticle[];
}

// ฟังก์ชันช่วยดึง list ของ articles แบบ type-safe
function extractArticles(data: ApiResponse, prefix: string): Article[] {
  const list: ApiArticle[] = data.results || data.data || data.articles || [];
  return list.map((a, i) => ({
    id: `${prefix}-${i}`,
    title: a.title || "ไม่มีหัวข้อ",
    description: a.description || "ไม่มีรายละเอียด",
    url: a.link,
    image: a.image_url || "",
  }));
}

const categories = [
  { key: "tax", label: "เกี่ยวกับภาษี", query: "ภาษี" },
  { key: "finance", label: "เกี่ยวกับการเงิน", query: "การเงิน" },
  { key: "savings", label: "เกี่ยวกับการออมเงิน", query: "ออมเงิน" },
];

export default function ArticleSection() {
  const [articlesByCategory, setArticlesByCategory] = useState<
    Record<string, Article[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("tax");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);

      try {
        const results = await Promise.all(
          categories.map(async (cat) => {
            const url = `https://newsdata.io/api/1/news?apikey=pub_1cfdbf871b114cfdad87d304ed986a85&country=th&q=${encodeURIComponent(
              cat.query
            )}&language=th`;
            const res = await fetch(url);
            if (!res.ok) {
              console.error(`Error fetching ${cat.key}:`, res.status);
              return { key: cat.key, articles: [] as Article[] };
            }
            const data: ApiResponse = await res.json();
            return { key: cat.key, articles: extractArticles(data, cat.key) };
          })
        );

        const newData: Record<string, Article[]> = {};
        results.forEach(({ key, articles }) => {
          newData[key] = articles;
        });
        setArticlesByCategory(newData);
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const renderGrid = (articles: Article[]) => {
    const displayed = showAll ? articles : articles.slice(0, 6);
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition overflow-hidden"
            >
              <div className="relative h-36 w-full bg-gray-200">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center text-4xl text-green-700 w-full h-full">
                    📖
                  </div>
                )}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-2">
                  <h3 className="text-white text-sm font-semibold line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </div>
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

  return (
    <section
      id="articles"
      className="w-full max-w-6xl mx-auto px-6 mb-20 relative"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ข่าวล่าสุด</h2>

      {/* ปุ่มหมวดหมู่ */}
      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setShowAll(false);
            }}
            className={`py-2 px-4 rounded-lg font-medium transition ${
              activeCategory === cat.key
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

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
