import { Order } from "../models/order.model.js";

export async function hasPurchasedProduct(req, res, next) {
  try {
    const { userId } = req.auth(); // Clerk mới
    const { productId } = req.body;

    const order = await Order.findOne({
      clerkId: userId,
      "orderItems.product": productId,
    });

    if (!order) {
      return res.status(403).json({
        message: "You must purchase this product before commenting",
      });
    }

    next();
  } catch (error) {
    console.error("Purchase check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}