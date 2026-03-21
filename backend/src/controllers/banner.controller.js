import { Banner } from "../models/banner.model.js";

export async function getAllBanners(_, res) {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Không thể tải banner" });
  }
}