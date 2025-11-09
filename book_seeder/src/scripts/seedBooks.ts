import fs from "fs/promises";
import path from "path";
import { sequelize } from "../config";
import { Book, Subject } from "../models";

const DATA_PATH = path.resolve(__dirname, "../seed/books.json");

async function seedBooks() {
  try {
    console.log("Starting book seeding...");

    await sequelize.authenticate();
    console.log("Database connection established");

    const bookCount = await Book.count();
    if (bookCount > 0) {
      console.log(`📘 ${bookCount} books already exist. Skipping seeding.`);
      await sequelize.close();
      return;
    }

    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const books = JSON.parse(raw);
    console.log(`Loaded ${books.length} books from JSON file`);

    for (const entry of books) {
      const [subject] = await Subject.findOrCreate({
        where: { name: entry.mainSubject },
      });

      const book = await Book.create({
        title: entry.title,
        author: entry.author,
        isbn: entry.isbn,
        publishedYear: entry.publishedYear,
        coverUrl: entry.coverUrl,
        description: entry.description,
        externalSource: entry.externalSource,
        externalId: entry.externalId,
      });

      await book.addSubject(subject);
    }

    console.log(`Inserted ${books.length} books and subjects successfully!`);
  } catch (err) {
    console.error("Seeding failed:", (err as Error).message);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

(async () => {
  await seedBooks();
})();
