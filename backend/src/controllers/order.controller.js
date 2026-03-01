import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        error: "Đơn hàng không có sản phẩm",
      });
    }

    // Kiểm tra sản phẩm và tồn kho
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          error: `Không tìm thấy sản phẩm ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Sản phẩm ${product.name} không đủ số lượng tồn kho`,
        });
      }
    }

    const order = await Order.create({
      user: user._id,
      clerkId: user.clerkId,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
    });

    // Cập nhật tồn kho sản phẩm
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      message: "Đặt hàng thành công",
      order,
    });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({
      error: "Có lỗi xảy ra khi tạo đơn hàng",
    });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({
      clerkId: req.user.clerkId,
    })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // Lấy danh sách orderId
    const orderIds = orders.map((order) => order._id);

    // Kiểm tra đơn hàng đã được đánh giá hay chưa
    const reviews = await Review.find({
      orderId: { $in: orderIds },
    });

    const reviewedOrderIds = new Set(
      reviews.map((review) => review.orderId.toString())
    );

    const ordersWithReviewStatus = orders.map((order) => ({
      ...order.toObject(),
      hasReviewed: reviewedOrderIds.has(order._id.toString()),
    }));

    res.status(200).json({
      orders: ordersWithReviewStatus,
    });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({
      error: "Không thể lấy danh sách đơn hàng",
    });
  }
}