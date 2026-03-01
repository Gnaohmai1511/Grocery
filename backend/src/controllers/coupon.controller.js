import { Coupon } from "../models/coupon.model.js";
import { CouponUsage } from "../models/couponUsage.model.js";

export async function validateCoupon(req, res) {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ error: "Invalid coupon" });
    }

    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: "Coupon expired" });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order is $${coupon.minOrderAmount}`,
      });
    }

    // 🔥 CHECK: user đã dùng coupon chưa
    const used = await CouponUsage.findOne({
      user: userId,
      coupon: coupon._id,
    });

    if (used) {
      return res.status(400).json({
        error: "You have already used this coupon",
      });
    }

    // Tính discount (GIỮ NGUYÊN LOGIC CŨ)
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    res.json({ discount });
  } catch (err) {
    console.error("Validate coupon error:", err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
}