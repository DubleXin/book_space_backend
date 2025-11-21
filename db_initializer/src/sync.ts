import "dotenv/config";
import { sequelize } from "./config";

import {
  initUserModel,
  initRefreshTokenModel,
  initBookModel,
  initSubjectModel,
  initProfileModel,
  initReviewModel,
  initStarredBookModel,
  initRecommendationModel,
  initAiHighlightModel,
  associateAuthModels,
  associateBookModels,
  associateProfileModels,
} from "./models";

async function main() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected.");

    console.log("Initializing models...");

    // AUTH SERVICE MODELS
    initUserModel();
    initRefreshTokenModel();

    // BOOK SERVICE MODELS
    initBookModel();
    initSubjectModel();

    // PROFILE SERVICE MODELS
    initProfileModel();
    initReviewModel();
    initStarredBookModel();

    // RECOMMENDATION SERVICE MODELS
    initRecommendationModel();
    initAiHighlightModel();

    console.log("Setting up associations...");

    associateAuthModels();
    associateBookModels();
    associateProfileModels();
    // Recommendation models don't have associations between them

    console.log("Syncing database...");
    await sequelize.sync({ alter: true }); // or { force: true } if needed

    console.log("Database synced successfully!");
  } catch (err) {
    console.error("Error while syncing DB:", err);
  } finally {
    await sequelize.close();
    console.log("Connection closed.");
  }
}

main();
