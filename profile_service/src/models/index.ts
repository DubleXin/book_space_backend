import Profile from "./profile.model";
import Review from "./review.model";
import StarredBook from "./starredBook.model";

const associateModels = () => {
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

associateModels();

export { Profile, Review, StarredBook };
