import express from "express";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Lấy danh sách notification của user
router.get("/", getMyNotifications);

// Đánh dấu đã đọc
router.patch("/:id/read", markAsRead);

// ❗ XÓA notification (thêm mới)
router.delete("/:id", deleteNotification);

export default router;