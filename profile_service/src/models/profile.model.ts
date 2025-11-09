import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config";

interface ProfileAttributes {
  id: number;
  userId: number;
  username: string;
  bio?: string | null;
}

interface ProfileCreationAttributes
  extends Optional<ProfileAttributes, "id" | "bio"> {}

class Profile
  extends Model<ProfileAttributes, ProfileCreationAttributes>
  implements ProfileAttributes
{
  public id!: number;
  public userId!: number;
  public username!: string;
  public bio?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "profiles",
  }
);

export default Profile;
