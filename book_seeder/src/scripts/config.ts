export const OPEN_LIBRARY_BASE = "https://openlibrary.org";
export const SUBJECTS = [
  // Fiction (broad)
  "fantasy",
  "science_fiction",
  "mystery",
  "thriller",
  "romance",
  "historical_fiction",
  "classics",
  "adventure",

  // Non-fiction (broad)
  "biography",
  "history",
  "philosophy",
  "psychology",
  "self_help",
  "business",
  "economics",
  "politics",
  "science",
  "health",
  "travel",
  "cookbooks",

  // Formats / audiences
  "poetry",
  "comics",
  "young_adult",
  "children",
];

export const BOOKS_PER_SUBJECT = 20;
export const USER_AGENT = `DiplomaBookFetcher/1.1 (${process.env.USER_AGENT_CREDITS})`;
export const BOOKS_JSON_PATH = "../seed/books_1.json";
