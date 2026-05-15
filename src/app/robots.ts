import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/tools/soul-guide", "/report-review"],
    },
    sitemap: "https://www.upskilleveryday.com/sitemap.xml",
  };
}
