const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const FETCH_TIMEOUT_MS = 25000;

export async function getPageSpeedData(url, apiKey) {
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "PAGESPEED_API_KEY nu este setat" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      url,
      strategy: "mobile",
      key: apiKey,
    });
    params.append("category", "performance");
    params.append("category", "accessibility");
    params.append("category", "best-practices");
    params.append("category", "seo");

    const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, skipped: false, reason: `PageSpeed API a răspuns cu status ${res.status}` };
    }

    const data = await res.json();
    const categories = data?.lighthouseResult?.categories ?? {};
    const audits = data?.lighthouseResult?.audits ?? {};

    return {
      ok: true,
      performance_score: toScore(categories.performance?.score),
      accessibility_score: toScore(categories.accessibility?.score),
      best_practices_score: toScore(categories["best-practices"]?.score),
      seo_score: toScore(categories.seo?.score),
      largest_contentful_paint: audits["largest-contentful-paint"]?.displayValue ?? null,
      cumulative_layout_shift: audits["cumulative-layout-shift"]?.displayValue ?? null,
      total_blocking_time: audits["total-blocking-time"]?.displayValue ?? null,
    };
  } catch (error) {
    return { ok: false, skipped: false, reason: `Eroare la apelul PageSpeed: ${error.message}` };
  } finally {
    clearTimeout(timeout);
  }
}

function toScore(fraction) {
  if (typeof fraction !== "number") return null;
  return Math.round(fraction * 100);
}
