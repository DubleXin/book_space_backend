import { Sequelize } from "sequelize";
import dotenv from "dotenv";

console.log(process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  dotenv.config();
  console.log("after config ->", process.env.DATABASE_URL);
}

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "postgres",
  logging: false,
});

export default sequelize;
