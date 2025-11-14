import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config";

interface AIHighlightAttributes {
  id: number;
  userId: number;
  bookId: number;
  reason: string;
  score?: number | null; // optional if you want to store AI score
  generatedAt?: Date; // when highlight was generated
  expiresAt: Date; // TTL timestamp for caching logic
}

interface AIHighlightCreationAttributes
  extends Optional<AIHighlightAttributes, "id" | "score" | "generatedAt"> {}

class AIHighlight
  extends Model<AIHighlightAttributes, AIHighlightCreationAttributes>
  implements AIHighlightAttributes
{
  public id!: number;
  public userId!: number;
  public bookId!: number;
  public reason!: string;
  public score?: number | null;
  public generatedAt!: Date;
  public expiresAt!: Date;
}

AIHighlight.init(
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

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ai_recommendation_highlights",
  }
);

export default AIHighlight;
