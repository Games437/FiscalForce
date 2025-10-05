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

export default function ArticlePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/articles"); // เปลี่ยนเป็น API ของคุณ
        const data: Article[] = await res.json();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="articles">
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
