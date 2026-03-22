const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function getFileUrl(url) {
  if (!url) return "";

  const normalizedUrl = String(url).trim().replace(/\\/g, "/");

  if (normalizedUrl.startsWith("http")) return normalizedUrl;

  if (normalizedUrl.startsWith("data:") || normalizedUrl.startsWith("blob:")) {
    return normalizedUrl;
  }

  const path = normalizedUrl.startsWith("/")
    ? normalizedUrl
    : `/${normalizedUrl}`;

  return `${BASE_URL}${path}`;
}
