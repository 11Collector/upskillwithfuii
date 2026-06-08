import type { Metadata } from "next";
import { mockArticles } from "@/constants/article";

const BASE_URL = "https://www.upskilleveryday.com";

// Map Thai short date "31 มี.ค. 2026" → ISO "2026-03-31"
function thaiDateToISO(thaiDate: string): string {
  const MONTHS: Record<string, string> = {
    "ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04",
    "พ.ค.": "05", "มิ.ย.": "06", "ก.ค.": "07", "ส.ค.": "08",
    "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12",
  };
  const parts = thaiDate.trim().split(/\s+/);
  if (parts.length < 3) return new Date().toISOString();
  const [day, mon, year] = parts;
  const month = MONTHS[mon] ?? "01";
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "หนังสือ":         ["สรุปหนังสือ", "book summary", "หนังสือพัฒนาตัวเอง", "book review ภาษาไทย"],
  "พัฒนาตัวเอง":    ["mindset", "growth mindset", "self improvement", "พัฒนาตัวเอง"],
  "การเงิน & ลงทุน": ["การเงินส่วนบุคคล", "การลงทุน", "money mindset", "wealth building", "ออมเงิน"],
  "ธุรกิจ":          ["ธุรกิจ", "startup", "entrepreneur", "business strategy"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = mockArticles.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "บทความ | Upskill Everyday",
      description: "อ่านบทความพัฒนาตัวเองจาก Upskill Everyday",
    };
  }

  const url        = `${BASE_URL}/library/${article.slug}`;
  const isoDate    = thaiDateToISO(article.date);
  const keywords   = [
    "พัฒนาตัวเอง", "upskill", "อัพสกิล", "upskilleveryday",
    article.category,
    ...(CATEGORY_KEYWORDS[article.category] ?? []),
    // Pull meaningful words from title as long-tail keywords
    ...article.title.split(/[\s,]+/).filter((w) => w.length > 3).slice(0, 5),
  ];

  return {
    title:       `${article.title} | Upskill Everyday`,
    description: article.excerpt,
    keywords,
    authors: [{ name: "Fuii", url: BASE_URL }],
    openGraph: {
      title:         article.title,
      description:   article.excerpt,
      url,
      siteName:      "Upskill Everyday",
      locale:        "th_TH",
      type:          "article",
      publishedTime: isoDate,
      modifiedTime:  isoDate,
      authors:       ["Fuii"],
      tags:          keywords,
      images: [
        { url: `${BASE_URL}/og-library.png`, width: 1200, height: 630, alt: article.title },
      ],
    },
    twitter: {
      card:        "summary_large_image",
      title:       article.title,
      description: article.excerpt,
      images:      [`${BASE_URL}/og-library.png`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
