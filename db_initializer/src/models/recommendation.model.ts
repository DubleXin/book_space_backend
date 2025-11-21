import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config";

interface RecommendationAttributes {
  id: number;
  userId: number;
  bookId: number;
  reason: string;
  score?: number | null;
  generatedAt?: Date;
}

interface RecommendationCreationAttributes
  extends Optional<RecommendationAttributes, "id" | "score" | "generatedAt"> {}

class Recommendation
  extends Model<RecommendationAttributes, RecommendationCreationAttributes>
  implements RecommendationAttributes
{
  public id!: number;
  public userId!: number;
  public bookId!: number;
  public reason!: string;
  public score?: number | null;
  public generatedAt!: Date;
}

export const initRecommendationModel = () =>
  Recommendation.init(
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
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      generatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "recommendations",
    }
  );

export default Recommendation;
