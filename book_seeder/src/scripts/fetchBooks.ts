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

/** Safe GET with retry on HTTP 429 */
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

/** Fetch description & subjects from a work entry */
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
  } catch (err) {
    console.warn(`Failed to fetch work ${workKey}`);
    return { description: "no description provided", subjects: ["none"] };
  }
}

/* ----------------------------- Main logic ----------------------------- */

async function fetchBooks() {
  const allBooks: any[] = [];

  for (const subject of SUBJECTS) {
    console.log(`Fetching ${BOOKS_PER_SUBJECT} books for genre: ${subject}`);

    const url = `${OPEN_LIBRARY_BASE}/search.json?subject=${encodeURIComponent(
      subject
    )}&limit=${BOOKS_PER_SUBJECT}`;

    const data = await safeGet(url);
    const docs: any[] = data?.docs ?? [];

    for (const entry of docs) {
      const bookData = await fetchBookData(entry.key);

      const book = {
        title: entry.title,
        author: entry.author_name?.[0] ?? "Unknown",
        isbn: entry.isbn?.[0] ?? null,
        publishedYear: entry.first_publish_year ?? null,
        coverUrl: entry.cover_i
          ? `https://covers.openlibrary.org/b/id/${entry.cover_i}-M.jpg`
          : null,
        description: bookData.description,
        externalSource: "openlibrary",
        externalId: entry.key,
        subjects: bookData.subjects,
        mainSubject: subject,
      };

      allBooks.push(book);

      await sleep(500);
    }

    console.log("Cooling down 3 s before next subject...");
    await sleep(3000);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(allBooks, null, 2));
  console.log(`Saved ${allBooks.length} books to ${outputPath}`);
}

/* ----------------------------- Runner ----------------------------- */

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
