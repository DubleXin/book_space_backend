import app from "./app";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    app.listen(PORT, () => console.debug(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Unable to connect to start server:", error);
  }
})();
