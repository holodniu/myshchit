import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/projects/", // личные проекты не индексируем
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: "https://myshchit.ru/sitemap.xml",
    host: "https://myshchit.ru",
  };
}
