import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createReview(req, res) {
  try {
    const { productId, orderId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Đánh giá phải nằm trong khoảng từ 1 đến 5 sao",
      });
    }

    const user = req.user;

    // kiểm tra đơn hàng tồn tại và đã giao
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        error: "Không tìm thấy đơn hàng",
      });
    }

    if (order.clerkId !== user.clerkId) {
      return res.status(403).json({
        error: "Bạn không có quyền đánh giá đơn hàng này",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        error: "Chỉ có thể đánh giá đơn hàng đã giao",
      });
    }

    // kiểm tra sản phẩm có trong đơn hàng hay không
    const productInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!productInOrder) {
      return res.status(400).json({
        error: "Sản phẩm không tồn tại trong đơn hàng này",
      });
    }

    // tạo hoặc cập nhật review (atomic)
    const review = await Review.findOneAndUpdate(
      { productId, userId: user._id },
      { rating, orderId, productId, userId: user._id },
      { new: true, upsert: true, runValidators: true }
    );

    // cập nhật lại rating trung bình của sản phẩm
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        averageRating: totalRating / reviews.length,
        totalReviews: reviews.length,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      await Review.findByIdAndDelete(review._id);
      return res.status(404).json({
        error: "Không tìm thấy sản phẩm",
      });
    }

    res.status(201).json({
      message: "Gửi đánh giá thành công",
      review,
    });
  } catch (error) {
    console.error("Error in createReview controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: "Không tìm thấy đánh giá",
      });
    }

    if (review.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Bạn không có quyền xoá đánh giá này",
      });
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(reviewId);

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);

    await Product.findByIdAndUpdate(productId, {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
    });

    res.status(200).json({
      message: "Xoá đánh giá thành công",
    });
  } catch (error) {
    console.error("Error in deleteReview controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}