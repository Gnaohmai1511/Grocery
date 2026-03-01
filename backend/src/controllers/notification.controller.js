import { Notification } from "../models/notification.model.js";

export async function getMyNotifications(req, res) {
  try {
    const clerkId = req.headers["x-clerk-id"];

    if (!clerkId) {
      return res.status(400).json({
        error: "Thiếu thông tin người dùng (clerkId)",
      });
    }

    const notifications = await Notification.find({
      clerkId,
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({
      error: "Không thể tải thông báo",
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, {
      isRead: true,
    });

    res.status(200).json({
      message: "Đã đánh dấu thông báo là đã đọc",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      error: "Không thể cập nhật trạng thái thông báo",
    });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      message: "Đã xóa thông báo",
    });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({
      error: "Không thể xóa thông báo",
    });
  }
}