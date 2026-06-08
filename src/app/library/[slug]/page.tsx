import { mockArticles } from "@/constants/article";
import ArticleClient from "./ArticleClient";

export async function generateStaticParams() {
  return mockArticles.map((article) => ({ slug: article.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = mockArticles.find((a) => a.slug === slug) ?? null;

  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        author: {
          "@type": "Person",
          name: "Fuii",
          url: "https://www.upskilleveryday.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Upskill Everyday",
          url: "https://www.upskilleveryday.com",
          logo: {
            "@type": "ImageObject",
            url: "https://www.upskilleveryday.com/og-default.png",
          },
        },
        datePublished: article.date,
        dateModified: article.date,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.upskilleveryday.com/library/${article.slug}`,
        },
        image: "https://www.upskilleveryday.com/og-library.png",
        articleSection: article.category,
        inLanguage: "th",
        keywords: buildKeywords(article.category, article.title),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticleClient slug={slug} initialArticle={article} />
    </>
  );
}

function buildKeywords(category: string, title: string): string {
  const base = ["upskill", "พัฒนาตัวเอง", "upskilleveryday", "อัพสกิล"];
  const byCategory: Record<string, string[]> = {
    "หนังสือ":         ["สรุปหนังสือ", "book summary", "หนังสือพัฒนาตัวเอง", "book review"],
    "พัฒนาตัวเอง":    ["mindset", "growth mindset", "self improvement", "พัฒนาตัวเอง"],
    "การเงิน & ลงทุน": ["การเงิน", "การลงทุน", "money mindset", "wealth", "ออมเงิน"],
    "ธุรกิจ":          ["ธุรกิจ", "startup", "entrepreneur", "business"],
  };
  const extra = title
    .split(/[\s,]+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  return [...base, ...(byCategory[category] ?? []), ...extra].join(", ");
}
