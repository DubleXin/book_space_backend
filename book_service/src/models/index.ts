import { default as Book } from "./book.model";
import { default as Subject } from "./subject.model";

const associateModels = () => {
  Book.belongsToMany(Subject, { through: "book_subjects" });
  Subject.belongsToMany(Book, { through: "book_subjects" });
};

associateModels();

export { Book, Subject };
