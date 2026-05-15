import { MetadataRoute } from "next";
import { mockArticles } from "@/constants/article";

const BASE_URL = "https://www.upskilleveryday.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/library`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/tools/wheel-of-life`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/disc`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/money-avatar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/library-of-souls`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/khomsatsat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const articlePages: MetadataRoute.Sitemap = mockArticles.map((article) => ({
    url: `${BASE_URL}/library/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}
