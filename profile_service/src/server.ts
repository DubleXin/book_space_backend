import app from "./app";
import { sequelize } from "./config";

const PORT = process.env.PORT || 6000;

(async () => {
  try {
    await sequelize.authenticate();
    console.debug(`application mode is set to -> ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === "development")
      await sequelize.sync({ alter: true });
    console.debug("Database connected successfully.");

    app.listen(PORT, () => console.debug(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
