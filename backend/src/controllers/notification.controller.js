import { Notification } from "../models/notification.model.js";

// export async function getMyNotifications(req, res) {
//   try {
//     const notifications = await Notification.find({
//       clerkId: req.user.clerkId,
//     }).sort({ createdAt: -1 });

//     const unreadCount = notifications.filter(n => !n.isRead).length;

//     res.status(200).json({ notifications, unreadCount });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
export async function getMyNotifications(req, res) {
  try {
    const clerkId = req.headers["x-clerk-id"];

    if (!clerkId) {
      return res.status(400).json({ error: "Missing clerkId" });
    }

    const notifications = await Notification.find({
      clerkId,
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, {
      isRead: true,
    });

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}