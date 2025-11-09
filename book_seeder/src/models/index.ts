import { default as Book } from "./book.model";
import { default as Subject } from "./subject.model";

const associateModels = () => {
  Book.belongsToMany(Subject, { through: "book_subjects", as: "subjects" });
  Subject.belongsToMany(Book, { through: "book_subjects", as: "books" });
};

associateModels();

export { Book, Subject };
