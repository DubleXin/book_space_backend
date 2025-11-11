import { Request, Response } from "express";
import { Recommendation } from "../models";
import { generateAlgorithmicRecommendations } from "../services/algorithm.service";

const COOLDOWN_HOURS = 1;

export const getUserRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (process.env.NODE_ENV === "development") {
      console.debug(" Dev mode: skipping cooldown check");
      const newRecs = await generateAlgorithmicRecommendations(userId);
      return res.json({
        success: true,
        cached: false,
        data: newRecs,
        message: "Generated fresh recommendations (dev mode)",
      });
    }

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
      return res.json({
        success: true,
        cached: true,
        data: cached,
        message: `Using cached recommendations (within ${COOLDOWN_HOURS}h window)`,
      });
    }

    const newRecs = await generateAlgorithmicRecommendations(userId);
    return res.json({
      success: true,
      cached: false,
      data: newRecs,
      message: "New recommendations generated",
    });
  } catch (err) {
    console.error("Failed to get recommendations:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to get recommendations" });
  }
};
