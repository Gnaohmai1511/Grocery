import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Đảm bảo 1 user chỉ dùng 1 coupon 1 lần
 */
couponUsageSchema.index({ user: 1, coupon: 1 }, { unique: true });

export const CouponUsage = mongoose.model(
  "CouponUsage",
  couponUsageSchema
);