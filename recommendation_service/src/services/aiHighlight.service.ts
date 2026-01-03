import { Op } from "sequelize";
import { AIHighlight } from "../models";
import { aiClient, AI_MODEL } from "../config/ai";
import { getBooksByIds } from "./book.service";

const HIGHLIGHT_TTL_HOURS = 24;

interface HighlightSchema {
  highlights: {
    bookId: number;
    reason: string;
  }[];
}

function fallbackReason(b: any) {
  const subj = b.subjects?.[0];
  const author = b.author ? ` by ${b.author}` : "";
  const topic = subj ? ` (${subj})` : "";
  return `Worth a look: "${b.title}"${author}${topic}.`;
}

function validateAndFillHighlights(
  parsed: HighlightSchema,
  slimBooks: any[]
): HighlightSchema["highlights"] {
  const candidateIds = new Set<number>(slimBooks.map((b) => b.id));
  const seen = new Set<number>();
  const valid: HighlightSchema["highlights"] = [];

  for (const highlight of parsed.highlights ?? []) {
    if (!candidateIds.has(highlight.bookId)) continue;
    if (seen.has(highlight.bookId)) continue;
    if (typeof highlight.reason !== "string") continue;

    const reason = highlight.reason.trim();
    if (!reason) continue;

    seen.add(highlight.bookId);
    valid.push({ bookId: highlight.bookId, reason });

    if (valid.length === 5) break;
  }

  if (valid.length < 5) {
    for (const b of slimBooks) {
      if (valid.length === 5) break;
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      valid.push({ bookId: b.id, reason: fallbackReason(b) });
    }
  }

  if (valid.length < 5) {
    throw new Error("Not enough valid highlights after validation/fallback");
  }

  return valid;
}

export async function getAIHighlightsForUser(userId: number, books: any[]) {
  const now = new Date();

  const cached = await AIHighlight.findAll({
    where: {
      userId,
      expiresAt: { [Op.gt]: now },
    },
    order: [
      ["generatedAt", "DESC"],
      ["id", "DESC"],
    ],
    limit: 5,
  });

  if (cached.length > 0) {
    return cached.map((c) => ({
      id: c.id,
      bookId: c.bookId,
      reason: c.reason,
      generatedAt: c.generatedAt,
      expiresAt: c.expiresAt,
    }));
  }

  const bookIds = Array.from(
    new Set(
      (books ?? [])
        .map((r: any) => r.bookId)
        .filter((id: any) => Number.isInteger(id) && id > 0)
    )
  );

  const fullBooks = await getBooksByIds(bookIds);

  const byId = new Map<number, any>(
    fullBooks.map((b: any) => [Number(b.id), b])
  );

  const slimBooks = bookIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((b: any) => ({
      id: Number(b.id),
      title: b.title ?? "",
      author: b.author ?? "",
      subjects: (b.subjects ?? []).map((s: any) => s.name).filter(Boolean),
      description: b.description ?? "",
    }));

  const systemPrompt = `
You are a book recommendation assistant.

You receive a list of candidate books for a user.

Tasks:
- Select EXACTLY 5 UNIQUE books from the candidates.
- Prefer variety: avoid selecting more than 2 books that share the same first subject.
- Prefer books with richer descriptions over empty/short ones.
- Write a short explanation (max 2 sentences) per book.

Reason rules:
- Be specific (mention a theme/topic).
- Avoid generic reasons like "popular" without details.

Return ONLY valid JSON in the required schema.
`.trim();

  const userPayload = {
    userId,
    candidates: slimBooks,
  };

  const response = await aiClient.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "highlights",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["highlights"],
          properties: {
            highlights: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["bookId", "reason"],
                properties: {
                  bookId: { type: "integer" },
                  reason: { type: "string", maxLength: 240 },
                },
              },
            },
          },
        },
      },
    },
  });

  const text = response.output_text;

  let parsed: HighlightSchema;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("AI returned invalid JSON:", text);
    throw new Error("AI returned malformed JSON");
  }

  if (!parsed.highlights || !Array.isArray(parsed.highlights)) {
    console.error("AI JSON missing 'highlights':", parsed);
    throw new Error("AI JSON missing highlights");
  }
  const highlights = validateAndFillHighlights(parsed, slimBooks);

  const expiresAt = new Date(
    now.getTime() + HIGHLIGHT_TTL_HOURS * 60 * 60 * 1000
  );

  const created = await Promise.all(
    highlights.map((h) =>
      AIHighlight.create({
        userId,
        bookId: h.bookId,
        reason: h.reason,
        expiresAt,
      })
    )
  );

  return created.map((r) => ({
    id: r.id,
    bookId: r.bookId,
    reason: r.reason,
    generatedAt: r.generatedAt,
    expiresAt: r.expiresAt,
  }));
}
