import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config";
import Profile from "./profile.model";

interface ReviewAttributes {
  id: number;
  userId: number;
  bookId: number;
  message: string;
  rating?: number | null;
}

interface ReviewCreationAttributes
  extends Optional<ReviewAttributes, "id" | "rating"> {}

class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public id!: number;
  public userId!: number;
  public bookId!: number;
  public message!: string;
  public rating?: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initReviewModel = () =>
  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },
    },
    {
      sequelize,
      tableName: "reviews",
      timestamps: true,
    }
  );

export default Review;
