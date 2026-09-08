import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/s/" },
    sitemap: "https://sparck.com.ar/sitemap.xml",
  };
}
