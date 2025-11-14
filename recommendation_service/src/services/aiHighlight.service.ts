import { Op } from "sequelize";
import { AIHighlight } from "../models";
import { aiClient, AI_MODEL } from "../config/ai";

const HIGHLIGHT_TTL_HOURS = 24;

interface HighlightSchema {
  highlights: {
    bookId: number;
    reason: string;
  }[];
}

export async function getAIHighlightsForUser(userId: number, books: any[]) {
  const now = new Date();

  const cached = await AIHighlight.findAll({
    where: {
      userId,
      expiresAt: { [Op.gt]: now },
    },
    order: [["generatedAt", "DESC"]],
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

  const slimBooks = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    subjects: b.subjects?.map((s: any) => s.name),
    description: b.description,
  }));

  const systemPrompt = `
You are a book recommendation assistant.

You receive a list of books relevant to a user.

Your tasks:
1. Select the TOP 5 books from the "candidates".
2. For each, generate a short explanation (max 2 sentences).
3. Return ONLY valid JSON:

{
  "highlights": [
    { "bookId": number, "reason": string }
  ]
}

Rules:
- Only use bookIds from the candidates.
- No extra keys.
- No text outside JSON.
`;

  const userPayload = {
    userId,
    candidates: slimBooks,
  };

  const response = await aiClient.responses.create({
    model: AI_MODEL,
    instructions: systemPrompt,
    input: JSON.stringify(userPayload),
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

  const expiresAt = new Date(
    now.getTime() + HIGHLIGHT_TTL_HOURS * 60 * 60 * 1000
  );

  const created = await Promise.all(
    parsed.highlights.map((h) =>
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
