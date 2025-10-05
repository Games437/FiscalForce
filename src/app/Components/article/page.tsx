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
  return list.slice(0, 8).map((a, i) => ({
    id: `${prefix}-${i}`,
    title: a.title || "ไม่มีหัวข้อ",
    description: a.description || "ไม่มีรายละเอียด",
    url: a.link,
    image: a.image_url || "",
  }));
}

/*
function extractArticles(data: any[], prefix: string): Article[] {
  return data.slice(0, 8).map((a, i) => ({
    id: `${prefix}-${i}`,
    title: a.title || "ไม่มีหัวข้อ",
    description: a.body || "ไม่มีรายละเอียด",
    url: `https://jsonplaceholder.typicode.com/posts/${a.id}`,
    image: `https://via.placeholder.com/320x180?text=${encodeURIComponent(a.title?.slice(0, 10) || "Post")}`,
  }));
}
*/

export default function ArticleSection() {
  const [taxArticles, setTaxArticles] = useState<Article[]>([]);
  const [retirementArticles, setRetirementArticles] = useState<Article[]>([]);
  const [savingsArticles, setSavingsArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);

      const urls = [
        {
          key: "tax",
          url: "https://newsdata.io/api/1/news?apikey=pub_1cfdbf871b114cfdad87d304ed986a85&country=th&q=ภาษี&language=th",
        },
        {
          key: "retirement",
          url: "https://newsdata.io/api/1/news?apikey=pub_1cfdbf871b114cfdad87d304ed986a85&country=th&q=การเงิน&language=th",
        },
        {
          key: "savings",
          url: "https://newsdata.io/api/1/news?apikey=pub_1cfdbf871b114cfdad87d304ed986a85&country=th&q=ออมเงิน&language=th",
        },
      ];

/*
            const urls = [
        {
          key: "tax",
          url: "https://jsonplaceholder.typicode.com/photos",
        },
        {
          key: "retirement",
          url: "https://jsonplaceholder.typicode.com/photos",
        },
        {
          key: "savings",
          url: "https://jsonplaceholder.typicode.com/photos",
        },
      ];
*/
      try {
        const results = await Promise.all(
          urls.map(async ({ key, url }) => {
            try {
              const res = await fetch(url);
              if (!res.ok) {
                console.error(`Error fetching ${key}:`, res.status);
                return { key, articles: [] as Article[] };
              }

              const text = await res.text();
              let data: ApiResponse;
              try {
                data = JSON.parse(text);
              } catch {
                console.error(`Invalid JSON for ${key}, response text:`, text);
                return { key, articles: [] as Article[] };
              }

              return { key, articles: extractArticles(data, key) };
            } catch (err) {
              console.error(`Fetch failed for ${key}:`, err);
              return { key, articles: [] as Article[] };
            }
          })
        );

        results.forEach(({ key, articles }) => {
          if (key === "tax") setTaxArticles(articles);
          if (key === "retirement") setRetirementArticles(articles);
          if (key === "savings") setSavingsArticles(articles);
        });
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const renderArticles = (articles: Article[]) =>
    articles.length > 0 ? (
      articles.map((article) => (
        <div
          key={article.id}
          className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition overflow-hidden"
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
              <h3 className="text-white text-sm font-semibold line-clamp-2">{article.title}</h3>
            </div>
          </div>

          <div className="p-3 flex flex-col h-[150px]">
            <p className="text-sm text-gray-600 line-clamp-3 flex-1">{article.description}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg text-center text-sm font-medium transition"
            >
              อ่านต่อ
            </a>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 w-full">ไม่พบข่าวล่าสุด</p>
    );

  const renderLoader = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] bg-gray-200 rounded-2xl animate-pulse h-[250px]"
      ></div>
    ));

  return (
    <section id="articles" className="w-full max-w-6xl mx-auto px-6 mb-20 relative">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ข่าวล่าสุด</h2>

      <div className="mb-10">
        <h3 className="font-semibold text-lg mb-4">เกี่ยวกับภาษี</h3>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {loading ? renderLoader() : renderArticles(taxArticles)}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-semibold text-lg mb-4">เกี่ยวกับการเงิน</h3>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {loading ? renderLoader() : renderArticles(retirementArticles)}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-semibold text-lg mb-4">เกี่ยวกับการออมเงิน</h3>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {loading ? renderLoader() : renderArticles(savingsArticles)}
        </div>
      </div>
    </section>
  );
}
