import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 10000;
const LINK_CHECK_TIMEOUT_MS = 5000;
const MAX_LINKS_TO_CHECK = 8;
const CTA_PATTERNS = [
  /cere\s*ofert[aă]/i,
  /solicit[aă]\s*ofert[aă]/i,
  /programeaz[aă]/i,
  /contacteaz[aă]/i,
  /request\s*a\s*quote/i,
  /get\s*a\s*quote/i,
];
const EXPERIENCE_PATTERN = /(\d{1,3})\s*(?:de\s*)?ani\s*(?:de\s*)?(?:experien[țt][aă]|activitate)/i;
const CUI_PATTERN = /\bCUI\b|\bCIF\b|\bJ\d{2}\/\d+\/\d{4}\b/i;

function normalizeUrl(input) {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkReachable(url) {
  try {
    const res = await fetchWithTimeout(url, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

function extractFirstImpression($) {
  const title = $("title").first().text().trim() || null;
  const h1 = $("h1").first().text().trim() || null;
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const mainTextSample = bodyText.slice(0, 500) || null;
  const navItems = $("nav a, header a")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20);

  return {
    title,
    h1,
    main_text_sample: mainTextSample,
    main_text_length: bodyText.length,
    nav_items: navItems,
    nav_item_count: navItems.length,
  };
}

function extractContactConversion($) {
  const telLinks = $('a[href^="tel:"]');
  const hasPhoneLink = telLinks.length > 0;
  const phoneInHeader = $('header a[href^="tel:"], nav a[href^="tel:"]').length > 0;
  const phoneInFooter = $('footer a[href^="tel:"]').length > 0;

  const mailtoLinks = $('a[href^="mailto:"]');
  const hasEmail = mailtoLinks.length > 0;

  const whatsappLinks = $('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
  const hasWhatsapp = whatsappLinks.length > 0;

  const forms = $("form");
  const hasContactForm = forms.length > 0;
  const formFieldCount = forms.first().find("input, textarea, select").length;

  const bodyText = $("body").text();
  const ctaMatches = CTA_PATTERNS.filter((pattern) => pattern.test(bodyText));
  const hasCta = ctaMatches.length > 0;

  const contactNavLink = $('nav a, header a').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    const href = ($(el).attr("href") || "").toLowerCase();
    return text.includes("contact") || href.includes("contact");
  });
  const contactReachableFromNav = contactNavLink.length > 0;

  return {
    has_phone: hasPhoneLink,
    phone_clickable: hasPhoneLink,
    phone_in_header: phoneInHeader,
    phone_in_footer: phoneInFooter,
    has_email: hasEmail,
    has_whatsapp: hasWhatsapp,
    has_contact_form: hasContactForm,
    form_fields: formFieldCount,
    has_cta: hasCta,
    cta_examples: ctaMatches.map((p) => p.source).slice(0, 3),
    contact_reachable_from_nav: contactReachableFromNav,
    click_depth_to_contact: contactReachableFromNav ? 1 : null,
  };
}

async function extractSeoBasics($, baseUrl) {
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const h1Count = $("h1").length;
  const h2Count = $("h2").length;
  const canonical = $('link[rel="canonical"]').attr("href") || null;

  const images = $("img");
  const totalImages = images.length;
  const imagesWithAlt = images.filter((_, el) => !!$(el).attr("alt")?.trim()).length;
  const altTextCoverage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : null;

  const internalLinks = $("a[href]").filter((_, el) => {
    const href = $(el).attr("href") || "";
    return href.startsWith("/") || href.includes(new URL(baseUrl).hostname);
  });

  let origin;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    origin = baseUrl;
  }

  const [sitemapReachable, robotsReachable] = await Promise.all([
    checkReachable(`${origin}/sitemap.xml`),
    checkReachable(`${origin}/robots.txt`),
  ]);

  return {
    title_length: $("title").first().text().trim().length,
    meta_description: metaDescription,
    meta_description_length: metaDescription?.length ?? 0,
    h1_count: h1Count,
    h2_count: h2Count,
    has_canonical: !!canonical,
    alt_text_coverage_pct: altTextCoverage,
    internal_link_count: internalLinks.length,
    sitemap_reachable: sitemapReachable,
    robots_reachable: robotsReachable,
  };
}

function extractTechnicalSignals($, baseUrl) {
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasFavicon = $('link[rel*="icon"]').length > 0;
  const isHttps = baseUrl.startsWith("https://");

  const ogTags = $('meta[property^="og:"]');
  const hasOgTitle = $('meta[property="og:title"]').length > 0;
  const hasOgDescription = $('meta[property="og:description"]').length > 0;
  const hasOgImage = $('meta[property="og:image"]').length > 0;

  const hasStructuredData = $('script[type="application/ld+json"]').length > 0;

  const images = $("img");
  const totalImages = images.length;
  const imagesWithoutDimensions = images.filter(
    (_, el) => !$(el).attr("width") || !$(el).attr("height")
  ).length;
  const imagesWithoutLazyLoading = images.filter(
    (_, el) => $(el).attr("loading") !== "lazy"
  ).length;

  return {
    has_viewport_meta: hasViewport,
    has_favicon: hasFavicon,
    is_https: isHttps,
    has_og_title: hasOgTitle,
    has_og_description: hasOgDescription,
    has_og_image: hasOgImage,
    og_tag_count: ogTags.length,
    has_structured_data: hasStructuredData,
    image_count: totalImages,
    images_without_dimensions: imagesWithoutDimensions,
    images_without_lazy_loading: imagesWithoutLazyLoading,
  };
}

async function checkBrokenLinks($, baseUrl) {
  let hostname;
  try {
    hostname = new URL(baseUrl).hostname;
  } catch {
    return { checked_count: 0, broken_count: 0, broken_samples: [] };
  }

  const hrefs = $("a[href]")
    .map((_, el) => $(el).attr("href") || "")
    .get()
    .filter((href) => {
      if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return false;
      if (href.startsWith("/")) return true;
      try {
        return new URL(href, baseUrl).hostname === hostname;
      } catch {
        return false;
      }
    })
    .map((href) => {
      try {
        return new URL(href, baseUrl).href;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const uniqueLinks = [...new Set(hrefs)].slice(0, MAX_LINKS_TO_CHECK);

  const results = await Promise.all(
    uniqueLinks.map(async (link) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);
      try {
        const res = await fetch(link, { method: "HEAD", signal: controller.signal });
        return { link, broken: !res.ok };
      } catch {
        return { link, broken: true };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  const broken = results.filter((r) => r.broken);

  return {
    checked_count: uniqueLinks.length,
    broken_count: broken.length,
    broken_samples: broken.map((r) => r.link).slice(0, 5),
  };
}

async function crawlSecondaryPage($, baseUrl) {
  const candidateLinks = $("nav a, header a, footer a")
    .map((_, el) => ($(el).attr("href") || "").trim())
    .get()
    .filter((href) => href && !href.startsWith("#") && !href.startsWith("tel:") && !href.startsWith("mailto:"));

  let hostname;
  try {
    hostname = new URL(baseUrl).hostname;
  } catch {
    return null;
  }

  const keywords = /serviciu|servicii|service|contact|despre|about/i;
  const target = candidateLinks.find((href) => {
    if (!keywords.test(href)) return false;
    try {
      const resolved = new URL(href, baseUrl);
      return resolved.hostname === hostname && resolved.href !== baseUrl;
    } catch {
      return false;
    }
  });

  if (!target) return null;

  let resolvedUrl;
  try {
    resolvedUrl = new URL(target, baseUrl).href;
  } catch {
    return null;
  }

  try {
    const res = await fetchWithTimeout(resolvedUrl);
    if (!res.ok) return null;
    const html = await res.text();
    const $$ = cheerio.load(html);
    const title = $$("title").first().text().trim() || null;
    const metaDescription = $$('meta[name="description"]').attr("content")?.trim() || null;
    return { url: resolvedUrl, title, meta_description: metaDescription };
  } catch {
    return null;
  }
}

function extractServiceStructure($) {
  const navLinks = $("nav a, header a")
    .map((_, el) => ($(el).attr("href") || "").trim())
    .get()
    .filter(Boolean);

  const distinctPaths = new Set(
    navLinks
      .filter((href) => !href.startsWith("#") && !href.startsWith("tel:") && !href.startsWith("mailto:"))
      .map((href) => href.split("?")[0])
  );

  const serviceKeywords = /serviciu|servicii|service/i;
  const serviceLinks = navLinks.filter((href) => serviceKeywords.test(href));

  return {
    distinct_nav_path_count: distinctPaths.size,
    has_dedicated_service_links: serviceLinks.length > 1,
    service_link_count: serviceLinks.length,
  };
}

function extractTrustSignals($) {
  const bodyText = $("body").text();
  const experienceMatch = bodyText.match(EXPERIENCE_PATTERN);

  const portfolioKeywords = /portofoliu|proiecte|portfolio|lucrari|lucrări/i;
  const testimonialKeywords = /testimonial|recenzi|review|p[aă]reri\s*client/i;
  const certificationKeywords = /certificat|certificare|iso\s?\d+/i;

  const navAndBodySample = $("nav a, header a, h2, h3")
    .map((_, el) => $(el).text())
    .get()
    .join(" ");

  return {
    has_portfolio_section: portfolioKeywords.test(navAndBodySample),
    has_testimonials: testimonialKeywords.test(bodyText),
    has_certifications: certificationKeywords.test(bodyText),
    years_experience_mentioned: experienceMatch ? Number(experienceMatch[1]) : null,
    has_company_registration_data: CUI_PATTERN.test(bodyText),
    has_team_section: /echip[aă]|team/i.test(navAndBodySample),
    has_address: /\bstr\.|\bstrada\b|\bbd\.|\bbulevardul\b/i.test(bodyText),
  };
}

export async function analyzeWebsite(rawUrl) {
  const url = normalizeUrl(rawUrl);

  let response;
  try {
    response = await fetchWithTimeout(url);
  } catch (error) {
    return {
      ok: false,
      url,
      error: `Site inaccesibil: ${error.message}`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      url,
      error: `Site a răspuns cu status ${response.status}`,
    };
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const [seo, brokenLinks, secondaryPage] = await Promise.all([
    extractSeoBasics($, url),
    checkBrokenLinks($, url),
    crawlSecondaryPage($, url),
  ]);

  const homepageTitle = $("title").first().text().trim() || null;
  const homepageMetaDescription = $('meta[name="description"]').attr("content")?.trim() || null;

  const multiPage = {
    secondary_page_url: secondaryPage?.url ?? null,
    secondary_page_reachable: !!secondaryPage,
    duplicate_title: !!(
      secondaryPage?.title &&
      homepageTitle &&
      secondaryPage.title === homepageTitle
    ),
    duplicate_meta_description: !!(
      secondaryPage?.meta_description &&
      homepageMetaDescription &&
      secondaryPage.meta_description === homepageMetaDescription
    ),
  };

  return {
    ok: true,
    url,
    first_impression: extractFirstImpression($),
    contact_conversion: extractContactConversion($),
    seo_basics: seo,
    service_structure: extractServiceStructure($),
    trust_signals: extractTrustSignals($),
    technical_signals: extractTechnicalSignals($, url),
    broken_links: brokenLinks,
    multi_page: multiPage,
  };
}
