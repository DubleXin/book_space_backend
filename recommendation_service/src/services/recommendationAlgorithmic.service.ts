import { Recommendation } from "../models";
import { generateAlgorithmicRecommendations } from "./algorithm.service";

const COOLDOWN_HOURS = 1;
const CACHED_LIMIT = 20;

async function fetchLastBatch(userId: number) {
  const lastRecord = await Recommendation.findOne({
    where: { userId },
    order: [
      ["generatedAt", "DESC"],
      ["id", "DESC"],
    ],
  });

  if (!lastRecord) {
    return { generatedAt: null as Date | null, rows: [] as Recommendation[] };
  }

  const rows = await Recommendation.findAll({
    where: { userId, generatedAt: lastRecord.generatedAt },
    order: [
      ["score", "DESC"],
      ["id", "DESC"],
    ],
    limit: CACHED_LIMIT,
  });

  return { generatedAt: lastRecord.generatedAt as Date, rows };
}

export async function getAlgorithmicForUser(userId: number) {
  const { generatedAt: lastBatchAt, rows: cachedRows } = await fetchLastBatch(
    userId
  );

  const now = new Date();
  const withinCooldown =
    lastBatchAt &&
    (now.getTime() - new Date(lastBatchAt).getTime()) / (1000 * 60 * 60) <
      COOLDOWN_HOURS;

  if (withinCooldown) {
    return {
      data: cachedRows,
      cached: true,
      message: "Using cached recommendations (algorithmic)",
    };
  }

  const newBatchTimestamp = new Date();
  await generateAlgorithmicRecommendations(userId, newBatchTimestamp);

  const fresh = await Recommendation.findAll({
    where: { userId, generatedAt: newBatchTimestamp },
    order: [
      ["score", "DESC"],
      ["id", "DESC"],
    ],
    limit: CACHED_LIMIT,
  });

  return {
    data: fresh,
    cached: false,
    message: "Generated fresh algorithmic recommendations",
  };
}
