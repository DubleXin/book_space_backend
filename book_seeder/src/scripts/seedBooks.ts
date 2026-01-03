// seedBooks.ts
import fs from "fs/promises";
import path from "path";
import { sequelize } from "../config";
import { Book, Subject } from "../models";

const DATA_PATH = path.resolve(__dirname, "../seed/books_1.json");

const DEBUG = process.env.DEBUG_SEED?.toLowerCase() === "true";
const INCLUDE_WORK_SUBJECTS =
  process.env.INCLUDE_WORK_SUBJECTS?.toLowerCase() === "true";

const BATCH_SIZE = Math.max(
  1,
  parseInt(process.env.SEED_BATCH_SIZE ?? "25", 10)
);

function toSnakeCase(raw: string) {
  let s = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  const MAX_LEN = 120;
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN);

  return s;
}

function isNonEmptyString(v: any): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type SubjectRef = { id: number; name: string };

async function seedBooks() {
  try {
    console.log("Starting book seeding...");
    console.log(`- DATA_PATH: ${DATA_PATH}`);
    console.log(`- DEBUG_SEED: ${DEBUG}`);
    console.log(`- INCLUDE_WORK_SUBJECTS: ${INCLUDE_WORK_SUBJECTS}`);
    console.log(`- SEED_BATCH_SIZE: ${BATCH_SIZE}`);

    await sequelize.authenticate();
    console.log("Database connection established");

    const bookCount = await Book.count();
    if (bookCount > 0) {
      console.log(`${bookCount} books already exist. Skipping seeding.`);
      return;
    }

    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const entries = JSON.parse(raw) as any[];
    console.log(`Loaded ${entries.length} JSON entries`);

    const subjectCache = new Map<string, SubjectRef>();

    let booksCreated = 0;
    let booksFound = 0;
    let subjectsCreated = 0;
    let subjectsFound = 0;
    let subjectLinksCreated = 0;
    let skippedNoSubjects = 0;

    const getOrCreateSubject = async (rawName: string, t: any) => {
      const canonical = toSnakeCase(rawName);
      if (!canonical) return null;

      const cached = subjectCache.get(canonical);
      if (cached) return cached;

      const [subject, created] = await Subject.findOrCreate({
        where: { name: canonical },
        defaults: { name: canonical },
        transaction: t,
      });

      const ref: SubjectRef = { id: subject.id, name: canonical };
      subjectCache.set(canonical, ref);

      if (created) {
        subjectsCreated++;
        if (DEBUG) console.log(`Subject created: ${canonical}`);
      } else {
        subjectsFound++;
        if (DEBUG) console.log(`Subject exists:  ${canonical}`);
      }

      return ref;
    };

    for (let start = 0; start < entries.length; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, entries.length);

      await sequelize.transaction(async (t) => {
        for (let i = start; i < end; i++) {
          const entry = entries[i];

          if (!DEBUG && i % 10 === 0) {
            console.log(`-> Progress: ${i}/${entries.length}`);
          }

          const subjectNames = new Set<string>();

          if (Array.isArray(entry.mainSubjects))
            for (const s of entry.mainSubjects)
              if (isNonEmptyString(s)) subjectNames.add(s);

          if (isNonEmptyString(entry.mainSubject))
            subjectNames.add(entry.mainSubject);

          if (INCLUDE_WORK_SUBJECTS && Array.isArray(entry.subjects))
            for (const s of entry.subjects)
              if (isNonEmptyString(s)) subjectNames.add(s);

          if (subjectNames.size === 0) {
            skippedNoSubjects++;
            if (DEBUG) {
              console.log(
                `[!!!] [${i}] No subjects for: "${
                  entry?.title ?? "??"
                }" — skipping subject linking`
              );
            }
          }

          const hasExternal =
            isNonEmptyString(entry.externalSource) &&
            isNonEmptyString(entry.externalId);

          const where = hasExternal
            ? {
                externalSource: entry.externalSource,
                externalId: entry.externalId,
              }
            : { title: entry.title, author: entry.author ?? null };

          const defaults = {
            title: entry.title,
            author: entry.author ?? null,
            publishedYear: entry.publishedYear ?? null,
            coverUrl: entry.coverUrl ?? null,
            description: entry.description ?? null,
            externalSource: entry.externalSource ?? null,
            externalId: entry.externalId ?? null,
          };

          const [book, created] = await Book.findOrCreate({
            where,
            defaults,
            transaction: t,
          });

          if (created) {
            booksCreated++;
            if (DEBUG) {
              console.log(
                `[${i}] Book created: "${book.title}" (${
                  book.author ?? "Unknown"
                })`
              );
              if (hasExternal) {
                console.log(
                  `external: ${entry.externalSource}:${entry.externalId}`
                );
              }
            }
          } else {
            booksFound++;
            if (DEBUG) {
              console.log(
                `[${i}] Book exists:  "${book.title}" (${
                  book.author ?? "Unknown"
                })`
              );
              if (hasExternal) {
                console.log(
                  `external: ${entry.externalSource}:${entry.externalId}`
                );
              }
            }

            const patch: any = {};
            if (!book.coverUrl && entry.coverUrl)
              patch.coverUrl = entry.coverUrl;
            if (!book.description && entry.description)
              patch.description = entry.description;
            if (!book.publishedYear && entry.publishedYear)
              patch.publishedYear = entry.publishedYear;

            if (Object.keys(patch).length) {
              await book.update(patch, { transaction: t });
              if (DEBUG) console.log(`Patched missing fields:`, patch);
            }
          }

          const subjectsToAttach: SubjectRef[] = [];
          for (const rawName of subjectNames) {
            const subj = await getOrCreateSubject(rawName, t);
            if (subj) subjectsToAttach.push(subj);
          }

          if (!subjectsToAttach.length) continue;

          const existing = await book.getSubjects({
            attributes: ["id"],
            joinTableAttributes: [],
            transaction: t,
          });

          const existingIds = new Set<number>(existing.map((s: any) => s.id));
          const toAdd = subjectsToAttach.filter((s) => !existingIds.has(s.id));

          if (toAdd.length) {
            await book.addSubjects(
              toAdd.map((s) => s.id),
              { transaction: t } as any
            );

            subjectLinksCreated += toAdd.length;

            if (DEBUG) {
              console.log(
                `Linked ${toAdd.length} subject(s): ${toAdd
                  .map((s) => s.name)
                  .join(", ")}`
              );
            }
          } else if (DEBUG) {
            console.log(`[-] No new subjects to link (already linked)`);
          }
        }
      });

      if (!DEBUG) {
        console.log(`Batch committed: ${end}/${entries.length}`);
      }
    }

    console.log("Seed complete!");
    console.log(
      [
        `Books: created=${booksCreated}, existed=${booksFound}`,
        `Subjects: created=${subjectsCreated}, existed=${subjectsFound}, cacheSize=${subjectCache.size}`,
        `Links: added=${subjectLinksCreated}`,
        `Entries with no subjects=${skippedNoSubjects}`,
      ].join(" | ")
    );
  } catch (err) {
    console.error("[!!!] Seeding failed:", (err as Error).message);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

(async () => {
  await seedBooks();
})();
