import type { Metadata } from "next";
import { mockArticles } from "@/constants/article";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = mockArticles.find((a) => a.slug === params.slug);

  if (!article) {
    return {
      title: "บทความ | Upskill Everyday",
      description: "อ่านบทความพัฒนาตัวเองจาก Upskill Everyday",
    };
  }

  const url = `https://www.upskilleveryday.com/library/${article.slug}`;

  return {
    title: `${article.title} | Upskill Everyday`,
    description: article.excerpt,
    keywords: ["พัฒนาตัวเอง", "upskill", article.category, "mindset"],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      siteName: "Upskill Everyday",
      locale: "th_TH",
      type: "article",
      publishedTime: article.date,
      images: [{ url: "/og-library.png", width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: ["/og-library.png"],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
