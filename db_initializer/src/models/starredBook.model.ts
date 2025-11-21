import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config";
import Profile from "./profile.model";

interface StarredBookAttributes {
  id: number;
  userId: number;
  bookId: number;
}

interface StarredBookCreationAttributes
  extends Optional<StarredBookAttributes, "id"> {}

class StarredBook
  extends Model<StarredBookAttributes, StarredBookCreationAttributes>
  implements StarredBookAttributes
{
  public id!: number;
  public userId!: number;
  public bookId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initStarredBookModel = () =>
  StarredBook.init(
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
    },
    {
      sequelize,
      tableName: "starred_books",
      timestamps: true,
    }
  );

export default StarredBook;
