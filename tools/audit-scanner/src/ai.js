import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(__dirname, "..", "prompts", "audit-prompt.md");
const MODEL = "claude-haiku-4-5";

const FindingSchema = z.object({
  problem: z.string(),
  evidence: z.string(),
  commercial_impact: z.string(),
  recommendation: z.string(),
  priority: z.enum(["mare", "medie", "mica"]),
});

const AuditResponseSchema = z.object({
  findings: z.array(FindingSchema).max(5),
  top_opportunities: z.array(FindingSchema).max(3),
});

function loadSystemPrompt() {
  return readFileSync(PROMPT_PATH, "utf-8");
}

export async function interpretOpportunities({ context, scores, candidates }) {
  if (candidates.length === 0) {
    return { findings: [], top_opportunities: [], warnings: [] };
  }

  const client = new Anthropic();
  const system = loadSystemPrompt();

  const userPayload = {
    context,
    scores,
    candidates,
  };

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [
      {
        role: "user",
        content: JSON.stringify(userPayload, null, 2),
      },
    ],
    output_config: {
      format: zodOutputFormat(AuditResponseSchema),
    },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    return { findings: [], top_opportunities: [], warnings: ["AI nu a produs un răspuns valid; raportul conține doar scorurile."] };
  }

  const validEvidence = new Set(candidates.map((c) => c.evidence));
  const warnings = [];

  const filterGrounded = (list) =>
    list.filter((item) => {
      if (validEvidence.has(item.evidence)) return true;
      warnings.push(`Respins (evidence necorelat cu date reale): "${item.problem}"`);
      return false;
    });

  return {
    findings: filterGrounded(parsed.findings),
    top_opportunities: filterGrounded(parsed.top_opportunities),
    warnings,
  };
}
