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

export async function createPaymentIntent(req, res) {
  try {
    const { cartItems, shippingAddress, couponCode } = req.body;
    const user = req.user;
    
    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total from server-side (don't trust client - ever.)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
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

    const shipping = 10.0; // $10
    let discount = 0;

if (couponCode) {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon || coupon.expiresAt < new Date()) {
    return res.status(400).json({ error: "Invalid coupon" });
  }

  // 🔥 CHECK USER USED COUPON
  const used = await CouponUsage.findOne({
    user: user._id,
    coupon: coupon._id,
  });

  if (used) {
    return res.status(400).json({
      error: "Coupon already used",
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

const total = subtotal + shipping - discount;

    if (total <= 0) {
      return res.status(400).json({ error: "Invalid order total" });
    }

    // find or create the stripe customer
    let customer;
    if (user.stripeCustomerId) {
      // find the customer
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      // create the customer
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          clerkId: user.clerkId,
          userId: user._id.toString(),
        },
      });

      // add the stripe customer ID to the  user object in the DB
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    }

    // create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // convert to cents
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
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        couponCode: couponCode || "",
        totalPrice: total.toFixed(2),
      },
      // in the webhooks section we will use this metadata
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
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
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

if (event.type === "payment_intent.succeeded") {
  const paymentIntent = event.data.object;

  try {
    const {
      userId,
      orderItems,
      shippingAddress,
      totalPrice,
      discount,
      couponCode,
    } = paymentIntent.metadata;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existingOrder = await Order.findOne({
      "paymentResult.id": paymentIntent.id,
    });
    if (existingOrder) return res.json({ received: true });

    const order = await Order.create({
      user: userObjectId,
      orderItems: JSON.parse(orderItems),
      shippingAddress: JSON.parse(shippingAddress),
      paymentResult: {
        id: paymentIntent.id,
        status: "succeeded",
      },
      discount: Number(discount || 0),
      couponCode,
      totalPrice: Number(totalPrice),
    });

    // update stock
    for (const item of JSON.parse(orderItems)) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // ===== FIX COUPON USAGE =====
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

          console.log("✅ CouponUsage created");
        } catch (err) {
          if (err.code !== 11000) throw err;
          console.log("⚠️ CouponUsage duplicate ignored");
        }
      }
    }

    console.log("✅ Order created:", order._id);
  } catch (error) {
    console.error("Webhook order error:", error);
  }
}

  res.json({ received: true });
}