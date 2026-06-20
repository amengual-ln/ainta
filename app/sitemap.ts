import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sparck.com.ar";
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/eventos`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/recursos`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/talleres`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];
}
