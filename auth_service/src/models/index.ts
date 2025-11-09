import { default as User } from "./user.model";
import { default as RefreshToken } from "./refreshToken.model";

const associateModels = () => {
  User.hasMany(RefreshToken, { foreignKey: "userId", as: "tokens" });

  RefreshToken.belongsTo(User, { foreignKey: "userId" });
};

associateModels();

export { User, RefreshToken };
