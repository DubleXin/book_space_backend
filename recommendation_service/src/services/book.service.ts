import axios from "axios";

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || "http://api-book:4000";

export async function getBooksBySubjects(subjects: string[]) {
  const { data } = await axios.get(`${BOOK_SERVICE_URL}/api/book`, {
    params: { subject: subjects.join(",") },
  });
  return data?.data || [];
}

export async function getBooksByAuthors(authors: string[]) {
  const { data } = await axios.get(`${BOOK_SERVICE_URL}/api/book`, {
    params: { author: authors.join(",") },
  });
  return data?.data || [];
}

type BookServiceListResponse<T> = {
  success?: boolean;
  count?: number;
  data?: T;
  message?: string;
};

function unwrapList<T>(payload: BookServiceListResponse<T[]> | any): T[] {
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getBooksByIds(ids: number[]) {
  const uniqueIds = Array.from(
    new Set(ids.filter((n) => Number.isInteger(n) && n > 0))
  );

  if (uniqueIds.length === 0) return [];

  const limited = uniqueIds.slice(0, 50);

  const { data } = await axios.get(`${BOOK_SERVICE_URL}/api/book/batch`, {
    params: { ids: limited.join(",") },
  });

  return unwrapList<any>(data);
}
