import { Request, Response } from "express";
import { Profile } from "../models";

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    let profile = await Profile.findOne({ where: { userId } });

    if (!profile) {
      profile = await Profile.create({
        userId,
        username: `user_${userId}`,
        bio: null,
      });
      console.debug(`Created new profile for user ${userId}`);
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Failed to fetch or create profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username, bio } = req.body;

    const [updated] = await Profile.update(
      { username, bio },
      { where: { userId } }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });

    const updatedProfile = await Profile.findOne({ where: { userId } });
    return res.json({ success: true, data: updatedProfile });
  } catch (err) {
    console.error("Failed to update profile:", err);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const getProfileByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile by user id",
    });
  }
};
