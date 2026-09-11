import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdirSync, readFileSync } from "fs";
import { analyzeWebsite } from "./src/analyzer.js";
import { getPageSpeedData } from "./src/pagespeed.js";
import { computeScores } from "./src/rules.js";
import { buildOpportunityCandidates } from "./src/opportunities.js";
import { interpretOpportunities } from "./src/ai.js";
import { writeReport } from "./src/report.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");
const PORT = process.env.PORT || 4173;
const HOST = "127.0.0.1"; // legat doar de localhost — nu e expus în rețea

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.post("/api/audit", async (req, res) => {
  const { url, industry, city, service, skipPagespeed } = req.body || {};

  if (!url || !industry || !city || !service) {
    return res.status(400).json({ error: "Toate câmpurile (website, domeniu, localitate, serviciu) sunt obligatorii." });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY nu este setat pe server. Verifică .env." });
  }

  const context = { industry, city, service };

  try {
    const analysis = await analyzeWebsite(url);
    if (!analysis.ok) {
      return res.status(200).json({ error: analysis.error });
    }

    let pagespeed = { ok: false, skipped: true, reason: "dezactivat din UI" };
    if (!skipPagespeed) {
      pagespeed = await getPageSpeedData(analysis.url, process.env.PAGESPEED_API_KEY);
    }

    const scores = computeScores(analysis, pagespeed);
    const candidates = buildOpportunityCandidates(analysis, scores, pagespeed);
    const aiResult = await interpretOpportunities({ context, scores, candidates });

    const { jsonPath, mdPath } = writeReport({
      outDir: OUTPUT_DIR,
      context,
      analysis,
      scores,
      pagespeed,
      aiResult,
      candidates,
    });

    res.json({
      url: analysis.url,
      context,
      scores,
      pagespeed,
      aiResult,
      files: { jsonPath, mdPath },
    });
  } catch (error) {
    res.status(500).json({ error: `Eroare neașteptată: ${error.message}` });
  }
});

app.get("/api/audits", (_req, res) => {
  let files = [];
  try {
    files = readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    files = [];
  }

  const audits = files
    .map((file) => {
      try {
        const data = JSON.parse(readFileSync(join(OUTPUT_DIR, file), "utf-8"));
        return {
          file,
          website: data.audit?.website,
          industry: data.audit?.industry,
          city: data.audit?.city,
          created_at: data.audit?.created_at,
          top_count: data.audit_opportunities?.top_opportunities?.length ?? 0,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  res.json({ audits });
});

app.get("/api/audits/:file", (req, res) => {
  const { file } = req.params;
  if (!/^[a-z0-9.-]+\.json$/i.test(file)) {
    return res.status(400).json({ error: "Nume de fișier invalid." });
  }
  try {
    const data = JSON.parse(readFileSync(join(OUTPUT_DIR, file), "utf-8"));
    res.json(data);
  } catch {
    res.status(404).json({ error: "Auditul nu a fost găsit." });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Cebuc Digital Opportunity Scanner — UI local pornit pe http://${HOST}:${PORT}`);
});
