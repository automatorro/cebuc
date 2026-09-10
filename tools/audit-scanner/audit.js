#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { analyzeWebsite } from "./src/analyzer.js";
import { getPageSpeedData } from "./src/pagespeed.js";
import { computeScores } from "./src/rules.js";
import { buildOpportunityCandidates } from "./src/opportunities.js";
import { interpretOpportunities } from "./src/ai.js";
import { writeReport } from "./src/report.js";

const program = new Command();

program
  .name("audit")
  .description("Cebuc Digital Opportunity Scanner — audit comercial pentru un site de prospect")
  .requiredOption("--url <url>", "Domeniul/URL-ul de analizat, ex: firma.ro")
  .requiredOption("--industry <industry>", "Domeniul de activitate, ex: Construcții")
  .requiredOption("--city <city>", "Localitate, ex: Timișoara")
  .requiredOption("--service <service>", "Serviciul principal, ex: Renovări fațade")
  .option("--skip-pagespeed", "Sări peste analiza PageSpeed chiar dacă cheia API e prezentă", false)
  .option("--out <dir>", "Director de output", "./output");

program.parse();
const opts = program.opts();

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Eroare: ANTHROPIC_API_KEY nu este setat. Vezi .env.example.");
    process.exit(1);
  }

  const context = { industry: opts.industry, city: opts.city, service: opts.service };

  console.log(`✓ Pornire audit pentru ${opts.url}`);
  const analysis = await analyzeWebsite(opts.url);

  if (!analysis.ok) {
    console.error(`✗ ${analysis.error}`);
    process.exit(1);
  }
  console.log("✓ Structură analizată (prima impresie, contact, SEO, servicii, încredere)");

  let pagespeed = { ok: false, skipped: true, reason: "--skip-pagespeed setat" };
  if (!opts.skipPagespeed) {
    pagespeed = await getPageSpeedData(analysis.url, process.env.PAGESPEED_API_KEY);
    console.log(pagespeed.ok ? "✓ Mobile/viteză analizat (PageSpeed)" : `⚠ Mobile/viteză omis (${pagespeed.reason})`);
  }

  const scores = computeScores(analysis, pagespeed);
  console.log("✓ Scoruri calculate");

  const candidates = buildOpportunityCandidates(analysis, scores, pagespeed);
  console.log(`✓ ${candidates.length} probleme candidate identificate`);

  console.log("… Interpretare AI (Claude) pentru Top oportunități comerciale");
  const aiResult = await interpretOpportunities({ context, scores, candidates });
  console.log(`✓ Top ${aiResult.top_opportunities.length} oportunități generate`);

  const { jsonPath, mdPath } = writeReport({
    outDir: opts.out,
    context,
    analysis,
    scores,
    pagespeed,
    aiResult,
    candidates,
  });

  console.log("");
  console.log(`Raport JSON: ${jsonPath}`);
  console.log(`Raport Markdown: ${mdPath}`);
}

main().catch((error) => {
  console.error("Eroare neașteptată:", error.message);
  process.exit(1);
});
