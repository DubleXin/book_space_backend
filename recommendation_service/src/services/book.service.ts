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
