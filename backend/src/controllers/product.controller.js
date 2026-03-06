import { Product } from "../models/product.model.js";
import {Order} from "../models/order.model.js";
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
}
export async function getTopProducts(req, res) {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },

      {
        $group: {
          _id: "$orderItems.product",
          sold: { $sum: "$orderItems.quantity" },
        },
      },

      { $sort: { sold: -1 } },
      { $limit: 3 }, 

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          price: "$product.price",
          images: "$product.images",
          category: "$product.category",
          averageRating: "$product.averageRating",
          totalReviews: "$product.totalReviews",
          sold: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({
      message: "Không thể tải sản phẩm bán chạy",
    });
  }
}