import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Banner } from "../models/banner.model.js";
import { convertUSDtoVND } from "../services/exchange.service.js";

/* ================= CREATE PRODUCT ================= */
export async function createProduct(req, res) {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin sản phẩm" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Cần ít nhất một hình ảnh sản phẩm" });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "Tối đa 3 hình ảnh cho mỗi sản phẩm" });
    }

    const uploadResults = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      )
    );

    const imageUrls = uploadResults.map((r) => r.secure_url);

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: imageUrls,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product", error);
    res.status(500).json({ message: "Lỗi máy chủ khi tạo sản phẩm" });
  }
}

/* ================= GET ALL PRODUCTS ================= */
export async function getAllProducts(_, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).json({ message: "Không thể tải danh sách sản phẩm" });
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Tối đa 3 hình ảnh cho mỗi sản phẩm" });
      }

      const uploadResults = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: "products" })
        )
      );

      product.images = uploadResults.map((r) => r.secure_url);
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
  }
}

/* ================= DELETE PRODUCT ================= */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (product.images?.length) {
      const deletePromises = product.images.map((url) => {
        const publicId = "products/" + url.split("/products/")[1]?.split(".")[0];
        if (publicId) return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises.filter(Boolean));
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Không thể xóa sản phẩm" });
  }
}

/* ================= GET ALL ORDERS ================= */
export async function getAllOrders(_, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Không thể tải danh sách đơn hàng" });
  }
}

/* ================= UPDATE ORDER STATUS ================= */
export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ error: "Trạng thái đơn hàng không hợp lệ" });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    if (order.status === status) {
      return res.status(400).json({
        error: `Đơn hàng đã ở trạng thái '${status}'`,
      });
    }

    order.status = status;

    if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    let title = "Cập nhật đơn hàng";
    let message = "";

    switch (status) {
      case "pending":
        title = "Xác nhận đơn hàng ✅";
        message = "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.";
        break;
      case "shipped":
        title = "Đơn hàng đang giao 🚚";
        message = "Đơn hàng của bạn đang trên đường giao.";
        break;
      case "delivered":
        title = "Giao hàng thành công 📦";
        message = "Đơn hàng đã được giao thành công.";
        break;
    }

    await Notification.create({
      user: order.user._id,
      clerkId: order.clerkId,
      order: order._id,
      title,
      message,
    });

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
  }
}

/* ================= GET ALL CUSTOMERS ================= */
export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Không thể tải danh sách khách hàng" });
  }
}

/* ================= DASHBOARD STATS ================= */
export async function getDashboardStats(_, res) {
  try {
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenueUSD = revenueResult[0]?.total || 0;

    // Chuyển đổi từ USD sang VND theo tỉ giá hiện tại từ API
    let totalRevenue = 0;
    try {
      const vndPerUsd = await convertUSDtoVND(1);
      totalRevenue = totalRevenueUSD * vndPerUsd;
      console.log(`✅ Tỉ giá: 1 USD = ${vndPerUsd} VND`);
    } catch (error) {
      console.error("❌ Lỗi lấy tỉ giá, sử dụng tỉ giá mặc định:", error);
      totalRevenue = totalRevenueUSD * 23500; // Tỉ giá mặc định
    }

    const totalCustomers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Không thể tải dữ liệu thống kê" });
  }
}

/* ================= COUPONS ================= */
export async function createCoupon(req, res) {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount = 0,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive = true,
    } = req.body;

    if (!code || !type || !value || !expiresAt) {
      return res.status(400).json({ message: "Thiếu thông tin mã giảm giá" });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({ message: "Loại mã giảm giá không hợp lệ" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
    });

    res.status(201).json({ coupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Lỗi khi tạo mã giảm giá" });
  }
}

export async function getAllCoupons(_, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (error) {
    res.status(500).json({ message: "Không thể tải danh sách mã giảm giá" });
  }
}

export async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }

    Object.assign(coupon, req.body);
    if (req.body.code) coupon.code = req.body.code.toUpperCase();

    await coupon.save();

    res.status(200).json({ coupon });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật mã giảm giá" });
  }
}

export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa mã giảm giá thành công" });
  } catch (error) {
    res.status(500).json({ message: "Không thể xóa mã giảm giá" });
  }
}

/* ================= STATS ================= */
export async function getRevenueLast7Days(_, res) {
  try {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    const revenue = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 6)) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Lấy tỉ giá USD/VND từ API
    let vndPerUsd = 23500; // Tỉ giá mặc định
    try {
      vndPerUsd = await convertUSDtoVND(1);
      console.log(`✅ Tỉ giá: 1 USD = ${vndPerUsd} VND`);
    } catch (error) {
      console.error("❌ Lỗi lấy tỉ giá, sử dụng tỉ giá mặc định:", error);
    }

    const map = {};
    revenue.forEach((r) => (map[r._id] = r.revenue * vndPerUsd));

    res.json(last7Days.map((d) => ({ date: d, revenue: map[d] || 0 })));
  } catch {
    res.status(500).json({ message: "Không thể tải thống kê doanh thu" });
  }
}

export async function getTopProducts(_, res) {
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
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $project: { _id: 0, name: "$product.name", sold: 1 } },
    ]);

    res.json(topProducts);
  } catch {
    res.status(500).json({ message: "Không thể tải sản phẩm bán chạy" });
  }
}

export async function getOrderStatusStats(_, res) {
  try {
    const stats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    res.json(stats);
  } catch {
    res.status(500).json({ message: "Không thể tải thống kê trạng thái đơn hàng" });
  }
}
/* ================= CREATE BANNER ================= */
export async function createBanner(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Cần upload hình ảnh banner" });
    }

    // chỉ lấy 1 ảnh
    const file = req.files[0];

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
    });

    const banner = await Banner.create({
      image: result.secure_url,
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Lỗi tạo banner" });
  }
}

/* ================= DELETE BANNER ================= */
export async function deleteBanner(req, res) {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    // xóa trên cloudinary
    const publicId = "banners/" + banner.image.split("/banners/")[1]?.split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await Banner.findByIdAndDelete(id);

    res.json({ message: "Xóa banner thành công" });
  } catch (error) {
    res.status(500).json({ message: "Không thể xóa banner" });
  }
}