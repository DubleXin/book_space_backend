import { Request, Response } from "express";
import { getAlgorithmicForUser, getAIHighlightsForUser } from "../services";

export const getUserRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data, cached, message } = await getAlgorithmicForUser(userId);

    return res.json({
      success: true,
      cached,
      data,
      message,
    });
  } catch (err) {
    console.error("Failed to get recommendations:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get recommendations" });
  }
};

export const getEnhancedRecommendations = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const { data: algorithmic, cached } = await getAlgorithmicForUser(userId);
    const aiHighlights = await getAIHighlightsForUser(userId, algorithmic);

    return res.json({
      success: true,
      cachedAlgorithmic: cached,
      data: {
        recommendedBooks: algorithmic,
        aiHighlights,
      },
    });
  } catch (err) {
    console.error("Failed to get AI-enhanced recommendations:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to get AI-enhanced recommendations",
    });
  }
};
