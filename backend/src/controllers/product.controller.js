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

export async function getRecommendedProducts(req, res) {
  try {
    const user = req.user;

    const orders = await Order.find({ user: user._id }).populate(
      "orderItems.product",
      "category"
    );

    const purchasedIds = orders
      .flatMap((order) => order.orderItems.map((item) => item.product?._id))
      .filter(Boolean)
      .map((id) => id.toString());

    const wishlistIds = (user.wishlist || []).map((id) => id.toString());

    const wishlistProducts = await Product.find(
      { _id: { $in: wishlistIds } },
      "category"
    );

    const categories = [
      ...new Set([
        ...orders
          .flatMap((order) => order.orderItems.map((item) => item.product?.category))
          .filter(Boolean),
        ...wishlistProducts.map((product) => product.category).filter(Boolean),
      ]),
    ];

    let recommendedProducts = [];

    if (categories.length > 0) {
      recommendedProducts = await Product.find({
        category: { $in: categories },
        _id: { $nin: [...purchasedIds, ...wishlistIds] },
      })
        .sort({ averageRating: -1 })
        .limit(6)
        .select("name price images category averageRating totalReviews");
    }

    if (recommendedProducts.length < 4) {
      const topProducts = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            sold: { $sum: "$orderItems.quantity" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 6 },
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

      const extraProducts = topProducts.filter(
        (product) =>
          !purchasedIds.includes(product._id.toString()) &&
          !recommendedProducts.some((item) => item._id.toString() === product._id.toString())
      );

      recommendedProducts = recommendedProducts.concat(extraProducts).slice(0, 6);
    }

    res.json(recommendedProducts);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({
      message: "Không thể tải sản phẩm đề xuất",
    });
  }
}