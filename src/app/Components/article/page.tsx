"use client";
import { useEffect, useRef, useState } from "react";
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
  [key: string]: any;
}

export default function ArticleSection() {
  const [taxArticles, setTaxArticles] = useState<Article[]>([]);
  const [retirementArticles, setRetirementArticles] = useState<Article[]>([]);
  const [savingsArticles, setSavingsArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRefs = {
    tax: useRef<HTMLDivElement>(null),
    retirement: useRef<HTMLDivElement>(null),
    savings: useRef<HTMLDivElement>(null),
  };

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

  const scrollLeft = (key: keyof typeof scrollRefs) =>
    scrollRefs[key].current?.scrollBy({ left: -320, behavior: "smooth" });

  const scrollRight = (key: keyof typeof scrollRefs) =>
    scrollRefs[key].current?.scrollBy({ left: 320, behavior: "smooth" });

  const renderArticles = (articles: Article[]) =>
    articles.length > 0 ? (
      articles.map((article) => (
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📌 บทความล่าสุด</h2>

      <ArticleRow
        title="🧾 ภาษี"
        scrollRef={scrollRefs.tax}
        articles={taxArticles}
        loading={loading}
        scrollLeft={() => scrollLeft("tax")}
        scrollRight={() => scrollRight("tax")}
        renderArticles={renderArticles}
        renderLoader={renderLoader}
      />

      <ArticleRow
        title="🏖️ การวางแผนเกษียณ"
        scrollRef={scrollRefs.retirement}
        articles={retirementArticles}
        loading={loading}
        scrollLeft={() => scrollLeft("retirement")}
        scrollRight={() => scrollRight("retirement")}
        renderArticles={renderArticles}
        renderLoader={renderLoader}
      />

      <ArticleRow
        title="💰 การออมเงิน"
        scrollRef={scrollRefs.savings}
        articles={savingsArticles}
        loading={loading}
        scrollLeft={() => scrollLeft("savings")}
        scrollRight={() => scrollRight("savings")}
        renderArticles={renderArticles}
        renderLoader={renderLoader}
      />
    </section>
  );
}

interface ArticleRowProps {
  title: string;
  scrollRef: React.RefObject<HTMLDivElement>;
  articles: Article[];
  loading: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
  renderArticles: (articles: Article[]) => JSX.Element;
  renderLoader: () => JSX.Element[];
}

function ArticleRow({
  title,
  scrollRef,
  articles,
  loading,
  scrollLeft,
  scrollRight,
  renderArticles,
  renderLoader,
}: ArticleRowProps) {
  return (
    <div className="mb-10 relative">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
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
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
      >
        {loading ? renderLoader() : renderArticles(articles)}
      </div>
    </div>
  );
}
