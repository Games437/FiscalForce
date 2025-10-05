"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

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
  [key: string]: unknown; // ใช้ unknown แทน any
}

export default function ArticleSection() {
  const [taxArticles, setTaxArticles] = useState<Article[]>([]);
  const [retirementArticles, setRetirementArticles] = useState<Article[]>([]);
  const [savingsArticles, setSavingsArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const [taxRes, retirementRes, savingsRes] = await Promise.all([
          fetch(
            "https://newsdata.io/api/1/news?apikey=pub_4a51121498744029b78fdfbe3e6628fd&country=th&q=ภาษี&language=th"
          ),
          fetch(
            "https://newsdata.io/api/1/news?apikey=pub_4a51121498744029b78fdfbe3e6628fd&country=th&q=การเงิน&language=th"
          ),
          fetch(
            "https://newsdata.io/api/1/news?apikey=pub_4a51121498744029b78fdfbe3e6628fd&country=th&q=ออมเงิน&language=th"
          ),
        ]);

        const [taxData, retirementData, savingsData]: ApiResponse[] =
          await Promise.all([taxRes.json(), retirementRes.json(), savingsRes.json()]);

        const toArticles = (data: ApiResponse, prefix: string): Article[] => {
          const list: ApiArticle[] =
            Array.isArray(data.results)
              ? data.results
              : Array.isArray(data.data)
              ? data.data
              : Array.isArray(data.articles)
              ? data.articles
              : [];

          return list.slice(0, 8).map((a, i) => ({
            id: `${prefix}-${i}`,
            title: a.title || "ไม่มีหัวข้อ",
            description: a.description || "ไม่มีรายละเอียด",
            url: a.link,
            image: a.image_url || "",
          }));
        };

        setTaxArticles(toArticles(taxData, "tax"));
        setRetirementArticles(toArticles(retirementData, "ret"));
        setSavingsArticles(toArticles(savingsData, "sav"));
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const renderArticles = (articles: Article[]): React.ReactNode => {
    if (articles.length === 0) {
      return <p className="text-center text-gray-500 w-full">ไม่พบข่าวล่าสุด</p>;
    }

    return articles.map((article) => (
      <div
        key={article.id}
        className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition overflow-hidden"
      >
        <div className="relative h-36 w-full bg-gray-200">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.title}
              width={320}
              height={180}
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
    ));
  };

  const renderLoader = (): React.ReactNode => {
    return Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] bg-gray-200 rounded-2xl animate-pulse h-[250px]"
      ></div>
    ));
  };

  return (
    <section id="articles" className="w-full max-w-6xl mx-auto px-6 mb-20 relative">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📌 บทความล่าสุด</h2>

      <ArticleRow title="🧾 ภาษี" articles={taxArticles} loading={loading} renderArticles={renderArticles} renderLoader={renderLoader} />
      <ArticleRow title="🏖️ การวางแผนเกษียณ" articles={retirementArticles} loading={loading} renderArticles={renderArticles} renderLoader={renderLoader} />
      <ArticleRow title="💰 การออมเงิน" articles={savingsArticles} loading={loading} renderArticles={renderArticles} renderLoader={renderLoader} />
    </section>
  );
}

interface ArticleRowProps {
  title: string;
  articles: Article[];
  loading: boolean;
  renderArticles: (articles: Article[]) => React.ReactNode;
  renderLoader: () => React.ReactNode;
}

function ArticleRow({ title, articles, loading, renderArticles, renderLoader }: ArticleRowProps) {
  return (
    <div className="mb-10 relative">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
        {loading ? renderLoader() : renderArticles(articles)}
      </div>
    </div>
  );
}
