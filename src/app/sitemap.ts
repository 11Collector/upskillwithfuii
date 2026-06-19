import { MetadataRoute } from "next";
import { mockArticles } from "@/constants/article";

const BASE_URL = "https://www.upskilleveryday.com";

function thaiDateToDate(thaiDate: string): Date {
  const MONTHS: Record<string, number> = {
    "ม.ค.": 0,  "ก.พ.": 1,  "มี.ค.": 2,  "เม.ย.": 3,
    "พ.ค.": 4,  "มิ.ย.": 5, "ก.ค.": 6,   "ส.ค.": 7,
    "ก.ย.": 8,  "ต.ค.": 9,  "พ.ย.": 10,  "ธ.ค.": 11,
  };
  const parts = thaiDate.trim().split(/\s+/);
  if (parts.length < 3) return new Date();
  const [day, mon, year] = parts;
  const month = MONTHS[mon] ?? 0;
  return new Date(Number(year), month, Number(day));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/library`,                      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/tools/wheel-of-life`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/disc`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/money-avatar`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/library-of-souls`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/khomsatsat`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const articlePages: MetadataRoute.Sitemap = mockArticles.map((article) => ({
    url:             `${BASE_URL}/library/${article.slug}`,
    lastModified:    thaiDateToDate(article.date),
    changeFrequency: "monthly",
    priority:        0.8,
  }));

  return [...staticPages, ...articlePages];
}
