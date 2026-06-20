// Same-origin geolocation. On Vercel, every request carries x-vercel-ip-* geo
// headers — reading them here (first-party) avoids the third-party IP-API calls
// that privacy browsers (Brave, uBlock) block. Falls back to null locally.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const h = request.headers;
  const cityRaw = h.get("x-vercel-ip-city");
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;
  const country = h.get("x-vercel-ip-country"); // ISO code, e.g. "US"
  return Response.json({ city, country });
}
