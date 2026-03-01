import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) {
        return res.status(401).json({
          message: "Chưa xác thực - token không hợp lệ",
        });
      }

      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(404).json({
          message: "Không tìm thấy người dùng",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({
        message: "Lỗi máy chủ nội bộ",
      });
    }
  },
];

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Chưa xác thực người dùng",
    });
  }

  if (req.user.email !== ENV.ADMIN_EMAIL) {
    return res.status(403).json({
      message: "Từ chối truy cập - chỉ dành cho quản trị viên",
    });
  }

  next();
};