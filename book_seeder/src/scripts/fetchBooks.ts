import axios from "axios";
import fs from "fs/promises";
import path from "path";
import {
  BOOKS_JSON_PATH,
  SUBJECTS,
  BOOKS_PER_SUBJECT,
  OPEN_LIBRARY_BASE,
  USER_AGENT,
} from "./config";

const outputPath = path.resolve(__dirname, BOOKS_JSON_PATH);

/* ----------------------------- Helpers ----------------------------- */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normText(s: string) {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function makeDedupeKey(entry: any) {
  if (entry?.key) return `openlibrary:${entry.key}`;

  const title = normText(entry?.title ?? "");
  const author = normText(entry?.author_name?.[0] ?? "unknown");
  return `title-author:${title}|${author}`;
}

function uniqMerge(a: string[], b: string[]) {
  const out = new Set<string>();
  for (const x of a ?? [])
    if (typeof x === "string" && x.trim()) out.add(x.trim());
  for (const x of b ?? [])
    if (typeof x === "string" && x.trim()) out.add(x.trim());
  return Array.from(out);
}

async function safeGet(url: string, retries = 3, delay = 5000): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await axios.get(url, {
        headers: { "User-Agent": USER_AGENT },
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        console.warn(
          `Rate limit hit (${url}). Waiting ${delay / 1000}s before retry (${
            attempt + 1
          }/${retries})...`
        );
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries: ${url}`);
}

async function fetchBookData(workKey: string) {
  try {
    const data = await safeGet(`https://openlibrary.org${workKey}.json`);
    const description =
      typeof data.description === "string"
        ? data.description
        : data.description?.value ?? "no description provided";

    const subjects =
      Array.isArray(data.subjects) && data.subjects.length > 0
        ? data.subjects
        : ["none"];

    return { description, subjects };
  } catch {
    console.warn(`Failed to fetch work ${workKey}`);
    return { description: "no description provided", subjects: ["none"] };
  }
}

type BookJson = {
  title: string;
  author: string;
  isbn: string | null;
  publishedYear: number | null;
  coverUrl: string | null;
  description: string;
  externalSource: "openlibrary";
  externalId: string;
  subjects: string[];
  mainSubjects: string[];
};

async function fetchBooks() {
  const byKey = new Map<string, BookJson>();

  for (const subject of SUBJECTS) {
    console.log(`Fetching ${BOOKS_PER_SUBJECT} books for genre: ${subject}`);

    const url = `${OPEN_LIBRARY_BASE}/search.json?subject=${encodeURIComponent(
      subject
    )}&limit=${BOOKS_PER_SUBJECT}`;

    const data = await safeGet(url);
    const docs: any[] = data?.docs ?? [];

    for (const entry of docs) {
      const key = makeDedupeKey(entry);

      const existing = byKey.get(key);
      if (existing) {
        existing.mainSubjects = uniqMerge(existing.mainSubjects, [subject]);

        continue;
      }

      const workKey = entry.key;
      const bookData = await fetchBookData(workKey);

      const book: BookJson = {
        title: entry.title,
        author: entry.author_name?.[0] ?? "Unknown",
        isbn: entry.isbn?.[0] ?? null,
        publishedYear: entry.first_publish_year ?? null,
        coverUrl: entry.cover_i
          ? `https://covers.openlibrary.org/b/id/${entry.cover_i}-M.jpg`
          : null,
        description: bookData.description,
        externalSource: "openlibrary",
        externalId: workKey,
        subjects: uniqMerge([], bookData.subjects),
        mainSubjects: [subject],
      };

      byKey.set(key, book);

      await sleep(500);
    }

    console.log("Cooling down 3 s before next subject...");
    await sleep(3000);
  }

  const allBooks = Array.from(byKey.values());

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(allBooks, null, 2));
  console.log(
    `Saved ${allBooks.length} unique books (deduped) to ${outputPath}`
  );
}

(async () => {
  const shouldFetch = process.env.FETCH_ON_START?.toLowerCase() === "true";
  if (!shouldFetch) {
    console.log("FETCH_ON_START set to false. No fetching performed");
    return;
  }
  try {
    console.log("Started fetching...");
    await fetchBooks();
    console.log("Fetch complete!");
  } catch (e) {
    console.error("Fetching failed:", (e as Error).message);
    process.exit(1);
  }
})();
