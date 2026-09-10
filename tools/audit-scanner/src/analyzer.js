import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 10000;
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

  const [seo] = await Promise.all([extractSeoBasics($, url)]);

  return {
    ok: true,
    url,
    first_impression: extractFirstImpression($),
    contact_conversion: extractContactConversion($),
    seo_basics: seo,
    service_structure: extractServiceStructure($),
    trust_signals: extractTrustSignals($),
  };
}
