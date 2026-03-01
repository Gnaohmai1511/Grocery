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
      return res.status(400).json({
        error: "Mã giảm giá không hợp lệ",
      });
    }

    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({
        error: "Mã giảm giá đã hết hạn",
      });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Đơn hàng tối thiểu phải từ $${coupon.minOrderAmount}`,
      });
    }

    // 🔥 KIỂM TRA: người dùng đã sử dụng mã này chưa
    const used = await CouponUsage.findOne({
      user: userId,
      coupon: coupon._id,
    });

    if (used) {
      return res.status(400).json({
        error: "Bạn đã sử dụng mã giảm giá này rồi",
      });
    }

    // Tính giảm giá (GIỮ NGUYÊN LOGIC CŨ)
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    res.status(200).json({ discount });
  } catch (err) {
    console.error("Validate coupon error:", err);
    res.status(500).json({
      error: "Không thể kiểm tra mã giảm giá",
    });
  }
}