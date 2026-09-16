function clamp(score) {
  return Math.max(0, Math.min(10, score));
}

function scoreFirstImpression(fi) {
  let score = 0;
  if (fi.title) score += 3;
  if (fi.h1) score += 3;
  if (fi.nav_item_count >= 3) score += 2;
  if (fi.main_text_length > 200) score += 2;
  return clamp(score);
}

function scoreContactConversion(cc) {
  let score = 0;
  if (cc.has_phone) score += 2;
  if (cc.phone_in_header || cc.phone_in_footer) score += 1;
  if (cc.has_contact_form) score += 2;
  if (cc.has_email) score += 1;
  if (cc.has_whatsapp) score += 2;
  if (cc.has_cta) score += 1;
  if (cc.contact_reachable_from_nav) score += 1;
  return clamp(score);
}

function scoreServices(ss) {
  let score = 4;
  if (ss.has_dedicated_service_links) score += 4;
  if (ss.distinct_nav_path_count >= 4) score += 2;
  return clamp(score);
}

function scoreTrust(ts) {
  let score = 0;
  if (ts.has_portfolio_section) score += 3;
  if (ts.has_testimonials) score += 2;
  if (ts.has_certifications) score += 1;
  if (ts.years_experience_mentioned) score += 2;
  if (ts.has_company_registration_data) score += 1;
  if (ts.has_team_section) score += 1;
  return clamp(score);
}

function scoreSeo(seo, tech) {
  let score = 0;
  if (seo.title_length > 0 && seo.title_length <= 60) score += 2;
  if (seo.meta_description_length > 0) score += 1;
  if (seo.h1_count === 1) score += 1;
  if (seo.h2_count > 0) score += 1;
  if (seo.has_canonical) score += 1;
  if (seo.sitemap_reachable) score += 1;
  if (seo.robots_reachable) score += 1;
  if (tech.has_og_title && tech.has_og_description && tech.has_og_image) score += 1;
  if (tech.has_structured_data) score += 1;
  return clamp(score);
}

function scoreTechnical(tech, brokenLinks) {
  let score = 0;
  if (tech.is_https) score += 3;
  if (tech.has_viewport_meta) score += 3;
  if (tech.has_favicon) score += 1;
  if (brokenLinks && brokenLinks.checked_count > 0) {
    score += brokenLinks.broken_count === 0 ? 3 : 0;
  } else {
    score += 2; // nimic de verificat, nu penalizăm și nu recompensăm integral
  }
  return clamp(score);
}

function scoreMobile(pagespeed) {
  if (!pagespeed || pagespeed.skipped || !pagespeed.ok) {
    return { score: null, incomplete: true };
  }
  const perf = pagespeed.performance_score ?? 0;
  return { score: clamp(Math.round(perf / 10)), incomplete: false };
}

export function computeScores(analysis, pagespeed) {
  const mobile = scoreMobile(pagespeed);

  return {
    prima_impresie: scoreFirstImpression(analysis.first_impression),
    contact_conversie: scoreContactConversion(analysis.contact_conversion),
    servicii: scoreServices(analysis.service_structure),
    incredere: scoreTrust(analysis.trust_signals),
    seo: scoreSeo(analysis.seo_basics, analysis.technical_signals),
    tehnic: scoreTechnical(analysis.technical_signals, analysis.broken_links),
    mobile: mobile.score,
    mobile_incomplete: mobile.incomplete,
  };
}
