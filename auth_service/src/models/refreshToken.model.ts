import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

class RefreshToken extends Model {
  public id!: number;
  public token!: string;
  public userId!: number;
  public expiresAt!: Date;
  public revoked!: boolean;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
  }
);

User.hasMany(RefreshToken, { foreignKey: "userId", as: "tokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

export default RefreshToken;
