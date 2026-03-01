import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Coupon } from "../models/coupon.model.js";
export async function createProduct(req, res) {
 try {
    const { name, description, price, stock, category } = req.body;
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images allowed" });
    }
    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
    });


    const uploadResults = await Promise.all(uploadPromises);
    //secure_url
    const imageUrls = uploadResults.map((result) => result.secure_url);

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
    res.status(500).json({ message: "Internal server error" });
 }
}

export async function getAllProducts(_, res) {
    try {
        //-1 = decending order poducts created recently
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateProduct(req, res) {
try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;

    // handle image updates if new images are uploaded
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images allowed" });
      }

      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((result) => result.secure_url);
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllOrders(_, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error in getAllOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ❗ tránh update lại cùng status
    if (order.status === status) {
      return res.status(400).json({
        error: `Order already in '${status}' status`,
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

    // 🔔 TẠO NOTIFICATION THEO STATUS
    let title = "Order update";
    let message = "";

    switch (status) {
      case "pending":
        title = "Order confirmed ✅";
        message = "Your order has been confirmed and is being prepared.";
        break;

      case "shipped":
        title = "Order shipped 🚚";
        message = "Your order is on the way!";
        break;

      case "delivered":
        title = "Order delivered 📦";
        message = "Your order has been delivered successfully.";
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
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find().sort({ createdAt: -1 }); // latest user first
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDashboardStats(_, res) {
  try {
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

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
    res.status(500).json({ error: "Internal server error" });
  }
}
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        // Extract public_id from URL (assumes format: .../products/publicId.ext)
        const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
        if (publicId) return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises.filter(Boolean));
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
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
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({ message: "Invalid coupon type" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
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
    res.status(500).json({ message: "Internal server error" });
  }
}

/* ================= GET ALL COUPONS ================= */
export async function getAllCoupons(_, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/* ================= UPDATE COUPON ================= */
export async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
    } = req.body;

    if (code) coupon.code = code.toUpperCase();
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiresAt) coupon.expiresAt = expiresAt;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({ coupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/* ================= DELETE COUPON ================= */
export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
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
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const map = {};
    revenue.forEach(r => (map[r._id] = r.revenue));

    res.json(
      last7Days.map(d => ({
        date: d,
        revenue: map[d] || 0,
      }))
    );
  } catch (e) {
    res.status(500).json({ message: "Failed to load revenue stats" });
  }
}
// GET /admin/stats/top-products
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
      {
        $project: {
          _id: 0,
          name: "$product.name",
          sold: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (e) {
    res.status(500).json({ message: "Failed to load top products" });
  }
}
// GET /admin/stats/order-status
export async function getOrderStatusStats(_, res) {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(stats);
  } catch (e) {
    res.status(500).json({ message: "Failed to load order status stats" });
  }
}