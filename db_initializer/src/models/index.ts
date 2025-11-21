import { default as User } from "./user.model";
import { default as RefreshToken } from "./refreshToken.model";

import { default as Book } from "./book.model";
import { default as Subject } from "./subject.model";

import Profile from "./profile.model";
import Review from "./review.model";
import StarredBook from "./starredBook.model";

export { default as Recommendation } from "./recommendation.model";
export { default as AIHighlight } from "./aIRecommendationHighlight.model";

import { initAiHighlightModel } from "./aIRecommendationHighlight.model";
import { initBookModel } from "./book.model";
import { initProfileModel } from "./profile.model";
import { initRecommendationModel } from "./recommendation.model";
import { initRefreshTokenModel } from "./refreshToken.model";
import { initReviewModel } from "./review.model";
import { initStarredBookModel } from "./starredBook.model";
import { initSubjectModel } from "./subject.model";
import { initUserModel } from "./user.model";

export const associateAuthModels = () => {
  User.hasMany(RefreshToken, { foreignKey: "userId", as: "tokens" });

  RefreshToken.belongsTo(User, { foreignKey: "userId" });
};

export const associateBookModels = () => {
  Book.belongsToMany(Subject, { through: "book_subjects", as: "subjects" });
  Subject.belongsToMany(Book, { through: "book_subjects", as: "books" });
};

export const associateProfileModels = () => {
  Profile.hasMany(Review, {
    foreignKey: "userId",
    sourceKey: "userId",
    as: "reviews",
  });

  Review.belongsTo(Profile, {
    foreignKey: "userId",
    targetKey: "userId",
    as: "profile",
  });

  Profile.hasMany(StarredBook, {
    foreignKey: "userId",
    sourceKey: "userId",
    as: "starredBooks",
  });

  StarredBook.belongsTo(Profile, {
    foreignKey: "userId",
    targetKey: "userId",
    as: "profile",
  });
};

export { Profile, Review, StarredBook, User, RefreshToken, Book, Subject };
export {
  initAiHighlightModel,
  initProfileModel,
  initReviewModel,
  initUserModel,
  initStarredBookModel,
  initRefreshTokenModel,
  initBookModel,
  initSubjectModel,
  initRecommendationModel,
};
