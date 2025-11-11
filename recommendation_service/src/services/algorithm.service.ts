import { getUserStars, getUserReviews } from "./profile.service";
import { getBooksBySubjects, getBooksByAuthors } from "./book.service";
import Recommendation from "../models/recommendation.model";

export async function generateAlgorithmicRecommendations(userId: number) {
  const stars = await getUserStars(userId);
  const reviews = await getUserReviews(userId);

  // --- Extract authors & subjects with weights ---
  const subjects = new Map<string, number>();
  const authors = new Set<string>();

  for (const starred of stars || []) {
    for (const s of starred.book?.subjects || []) {
      subjects.set(s.name, (subjects.get(s.name) || 0) + 1);
    }
    if (starred.book?.author) authors.add(starred.book.author);
  }

  for (const review of reviews || []) {
    const weight = Math.max(1, review.rating || 1); // stronger for higher ratings
    for (const s of review.book?.subjects || []) {
      subjects.set(s.name, (subjects.get(s.name) || 0) + weight);
    }
    if (review.book?.author) authors.add(review.book.author);
  }

  // Focus on top 3 most frequent subjects
  const topSubjects = Array.from(subjects.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // --- Fetch related books ---
  const subjectMatches = await getBooksBySubjects(topSubjects);
  const authorMatches = await getBooksByAuthors(Array.from(authors));

  // --- Skip already interacted books ---
  const interactedIds = new Set([
    ...stars.map((s: any) => s.bookId),
    ...reviews.map((r: any) => r.bookId),
  ]);

  // --- Score and rank ---
  const scored = new Map<number, { book: any; score: number }>();

  const addBook = (book: any, weight: number) => {
    if (interactedIds.has(book.id)) return; // skip starred/reviewed books
    const entry = scored.get(book.id);
    scored.set(book.id, {
      book,
      score: (entry?.score ?? 0) + weight,
    });
  };

  subjectMatches.forEach((b: any) => addBook(b, 1));
  authorMatches.forEach((b: any) => addBook(b, 2));

  // Small boost based on review ratings
  for (const review of reviews) {
    const entry = scored.get(review.bookId);
    if (entry) entry.score += (review.rating || 0) * 0.5;
  }

  // --- Sort & randomize slightly ---
  const ranked = Array.from(scored.values())
    .sort((a, b) => b.score - a.score || Math.random() - 0.5)
    .map((e) => e.book)
    .slice(0, 20);

  // --- Persist recommendations ---
  await Recommendation.bulkCreate(
    ranked.map((book) => ({
      userId,
      bookId: book.id,
      reason: "Matched by author/subject similarity",
      score: scored.get(book.id)?.score ?? 0,
      generatedAt: new Date(),
    })),
    { ignoreDuplicates: true }
  );

  return ranked;
}
