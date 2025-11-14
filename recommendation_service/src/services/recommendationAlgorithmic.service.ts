import { Recommendation } from "../models";
import { generateAlgorithmicRecommendations } from "./algorithm.service";

const COOLDOWN_HOURS = 1;

export async function getAlgorithmicForUser(userId: number) {
  const lastRecord = await Recommendation.findOne({
    where: { userId },
    order: [["generatedAt", "DESC"]],
  });

  const now = new Date();
  const withinCooldown =
    lastRecord &&
    (now.getTime() - new Date(lastRecord.generatedAt).getTime()) /
      (1000 * 60 * 60) <
      COOLDOWN_HOURS;

  if (withinCooldown) {
    const cached = await Recommendation.findAll({
      where: { userId },
      order: [["score", "DESC"]],
    });

    return {
      data: cached,
      cached: true,
      message: "Using cached recommendations (algorithmic)",
    };
  }

  const fresh = await generateAlgorithmicRecommendations(userId);

  return {
    data: fresh,
    cached: false,
    message: "Generated fresh algorithmic recommendations",
  };
}
