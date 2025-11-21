import { Model, Optional, DataTypes } from "sequelize";
import { sequelize } from "../config";

interface BookAttributes {
  id: number;
  title: string;
  author?: string | null;
  isbn?: string | null;
  publishedYear?: number | null;
  coverUrl?: string | null;
  description?: string | null;
  externalSource?: string | null;
  externalId?: number | null;
}

interface BookCreationAttributes extends Optional<BookAttributes, "id"> {}

class Book
  extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes
{
  public id!: number;
  public title!: string;
  public author?: string | null;
  public isbn?: string | null;
  public publishedYear?: number | null;
  public coverUrl?: string | null;
  public description?: string | null;
  public externalSource?: string | null;
  public externalId?: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initBookModel = () =>
  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      publishedYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      coverUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      externalSource: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      externalId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
    },
    {
      sequelize,
      tableName: "books",
    }
  );

export default Book;
