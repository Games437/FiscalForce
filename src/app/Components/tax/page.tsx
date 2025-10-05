"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface TaxArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
}

export default function TaxPage() {
  const [articles, setArticles] = useState<TaxArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/tax-articles"); // เปลี่ยนเป็น API ของคุณ
        const data: TaxArticle[] = await res.json();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch tax articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="tax-articles">
      {articles.map((article) => (
        <div key={article.id} className="article-card">
          {article.image && (
            <Image
              src={article.image}
              alt={article.title}
              width={600}
              height={400}
            />
          )}
          <h2>{article.title}</h2>
          <p>{article.description}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </div>
      ))}
    </div>
  );
}
