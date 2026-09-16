import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

function slugifyDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/[^a-z0-9.-]/gi, "-");
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

const PRIORITY_LABEL = { mare: "PRIORITATE MARE", medie: "PRIORITATE MEDIE", mica: "PRIORITATE MICĂ" };

function renderMarkdown({ context, analysis, scores, pagespeed, aiResult }) {
  const lines = [];
  lines.push(`# Digital Opportunity Report — ${analysis.url}`);
  lines.push("");
  lines.push(`**Domeniu de activitate:** ${context.industry}  `);
  lines.push(`**Localitate:** ${context.city}  `);
  lines.push(`**Serviciu principal:** ${context.service}`);
  lines.push("");
  lines.push("## Scoruri per categorie (0-10)");
  lines.push("");
  lines.push(`- Prima impresie: ${scores.prima_impresie}/10`);
  lines.push(`- Contact & conversie: ${scores.contact_conversie}/10`);
  lines.push(`- Servicii: ${scores.servicii}/10`);
  lines.push(`- Încredere: ${scores.incredere}/10`);
  lines.push(`- SEO: ${scores.seo}/10`);
  lines.push(`- Tehnic: ${scores.tehnic}/10`);
  lines.push(
    scores.mobile_incomplete
      ? `- Mobile: date incomplete (PageSpeed indisponibil)`
      : `- Mobile: ${scores.mobile}/10`
  );
  lines.push("");

  lines.push("## TOP 3 OPORTUNITĂȚI");
  lines.push("");
  if (aiResult.top_opportunities.length === 0) {
    lines.push("_Nu s-au identificat oportunități clare din datele disponibile._");
  } else {
    aiResult.top_opportunities.forEach((op, i) => {
      lines.push(`### ${i + 1}. ${op.problem} — ${PRIORITY_LABEL[op.priority]}`);
      lines.push("");
      lines.push(op.commercial_impact);
      lines.push("");
      lines.push(`**Ce recomandăm:** ${op.recommendation}`);
      lines.push("");
      lines.push(`_Dovadă: ${op.evidence}_`);
      lines.push("");
    });
  }

  const topEvidence = new Set(aiResult.top_opportunities.map((o) => o.evidence));
  const otherFindings = aiResult.findings.filter((f) => !topEvidence.has(f.evidence));

  if (otherFindings.length > 0) {
    lines.push("## Alte observații");
    lines.push("");
    otherFindings.forEach((f) => {
      lines.push(`- **${f.problem}** (${PRIORITY_LABEL[f.priority]}) — ${f.recommendation}`);
    });
    lines.push("");
  }

  if (aiResult.warnings.length > 0) {
    lines.push("## Avertismente interne (nu apar în raportul pentru client)");
    lines.push("");
    aiResult.warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (pagespeed?.skipped) {
    lines.push(`_Notă: analiza de viteză mobilă a fost omisă (${pagespeed.reason}). Rulează cu PAGESPEED_API_KEY setat pentru date complete._`);
  } else if (pagespeed && !pagespeed.ok) {
    lines.push(`_Notă: analiza de viteză mobilă a picat (${pagespeed.reason}). Restul raportului este complet._`);
  }

  return lines.join("\n");
}

export function writeReport({ outDir, context, analysis, scores, pagespeed, aiResult, candidates }) {
  mkdirSync(outDir, { recursive: true });
  const domain = slugifyDomain(analysis.url);
  const ts = timestamp();
  const base = `${domain}-${ts}`;

  const combined = {
    audit: {
      website: analysis.url,
      industry: context.industry,
      city: context.city,
      main_service: context.service,
      created_at: new Date().toISOString(),
    },
    audit_metrics: {
      raw_data: analysis,
      pagespeed,
      scores,
    },
    audit_opportunities: {
      candidates,
      findings: aiResult.findings,
      top_opportunities: aiResult.top_opportunities,
      warnings: aiResult.warnings,
    },
  };

  const jsonPath = join(outDir, `${base}.json`);
  const mdPath = join(outDir, `${base}.md`);

  writeFileSync(jsonPath, JSON.stringify(combined, null, 2), "utf-8");
  writeFileSync(mdPath, renderMarkdown({ context, analysis, scores, pagespeed, aiResult }), "utf-8");

  return { jsonPath, mdPath };
}
