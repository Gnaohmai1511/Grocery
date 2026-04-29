import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Coupon } from "../models/coupon.model.js";
import { CouponUsage } from "../models/couponUsage.model.js";
import mongoose from "mongoose";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

// ⚠️ Tỷ giá tạm (nên thay bằng API sau)
const VND_TO_USD_RATE = 1 / 24000;

function convertVNDToUSD(amountVND) {
  return amountVND * VND_TO_USD_RATE;
}

export async function createPaymentIntent(req, res) {
  try {
    const { cartItems, shippingAddress, couponCode } = req.body;
    const user = req.user;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        error: "Giỏ hàng đang trống",
      });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          error: `Không tìm thấy sản phẩm ${item.product.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Sản phẩm ${product.name} không đủ tồn kho`,
        });
      }

      subtotal += product.price * item.quantity;

      validatedItems.push({
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    const shipping = 10000; // ⚠️ đổi về VND (ví dụ 10k)
    let discount = 0;

    // ===== COUPON =====
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon || coupon.expiresAt < new Date()) {
        return res.status(400).json({
          error: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        });
      }

      const used = await CouponUsage.findOne({
        user: user._id,
        coupon: coupon._id,
      });

      if (used) {
        return res.status(400).json({
          error: "Bạn đã sử dụng mã giảm giá này rồi",
        });
      }

      if (coupon.type === "percentage") {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.value;
      }
    }

    const totalVND = subtotal + shipping - discount;

    if (totalVND <= 0) {
      return res.status(400).json({
        error: "Tổng đơn hàng không hợp lệ",
      });
    }

    // ===== CONVERT USD =====
    const totalUSD = convertVNDToUSD(totalVND);

    // ===== STRIPE CUSTOMER =====
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          clerkId: user.clerkId,
          userId: user._id.toString(),
        },
      });

      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customer.id,
      });
    }

    // ===== PAYMENT INTENT =====
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalUSD * 100), // USD → cents
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        clerkId: user.clerkId,
        userId: user._id.toString(),
        orderItems: JSON.stringify(validatedItems),
        shippingAddress: JSON.stringify(shippingAddress),
        subtotalVND: subtotal.toString(),
        discountVND: discount.toString(),
        totalVND: totalVND.toString(),
        totalUSD: totalUSD.toFixed(2),
        couponCode: couponCode || "",
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Không thể tạo yêu cầu thanh toán",
    });
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Lỗi webhook: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      const {
        userId,
        clerkId,
        orderItems,
        shippingAddress,
        totalUSD,
        totalVND,
        discountVND,
        couponCode,
      } = paymentIntent.metadata;

      const userObjectId = new mongoose.Types.ObjectId(userId);

      const existingOrder = await Order.findOne({
        "paymentResult.id": paymentIntent.id,
      });

      if (existingOrder) {
        return res.json({ received: true });
      }

      const order = await Order.create({
        user: userObjectId,
        clerkId: clerkId,
        orderItems: JSON.parse(orderItems),
        shippingAddress: JSON.parse(shippingAddress),
        paymentResult: {
          id: paymentIntent.id,
          status: "succeeded",
        },
        totalPriceUSD: Number(totalUSD),
        totalPriceVND: Number(totalVND),
        discount: Number(discountVND || 0),
        couponCode,
      });

      // ===== TRỪ KHO =====
      for (const item of JSON.parse(orderItems)) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // ===== GHI NHẬN COUPON =====
      const normalizedCouponCode =
        typeof couponCode === "string"
          ? couponCode.trim().toUpperCase()
          : null;

      if (normalizedCouponCode) {
        const coupon = await Coupon.findOne({
          code: normalizedCouponCode,
          isActive: true,
        });

        if (coupon) {
          try {
            await CouponUsage.create({
              user: userObjectId,
              coupon: coupon._id,
            });

            await Coupon.findByIdAndUpdate(coupon._id, {
              $inc: { usedCount: 1 },
            });

            console.log("✅ Đã ghi nhận coupon đã sử dụng");
          } catch (err) {
            if (err.code !== 11000) throw err;
            console.log("⚠️ Coupon đã được ghi nhận trước đó");
          }
        }
      }

      console.log("✅ Đơn hàng được tạo:", order._id);
    } catch (error) {
      console.error("Lỗi xử lý webhook đơn hàng:", error);
    }
  }

  res.json({ received: true });
}