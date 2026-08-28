import { MetadataRoute } from "next";
import config from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${config.domainName}`;
  const routes = [
    "",
    "/donate",
    "/get-involved",
    "/volunteer",
    "/gallery",
    "/about",
    "/501c3",
    "/contact",
    "/privacy-policy",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority:
      route === "" || route === "/donate"
        ? 1
        : route === "/privacy-policy"
        ? 0.3
        : 0.8,
  }));
}
