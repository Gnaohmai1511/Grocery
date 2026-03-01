import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

/* ================= GET CART ================= */
export async function getCart(req, res) {
  try {
    let cart = await Cart.findOne({ clerkId: req.user.clerkId })
      .populate("items.product");

    if (!cart) {
      const user = req.user;

      cart = await Cart.create({
        user: user._id,
        clerkId: user.clerkId,
        items: [],
      });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error in getCart controller:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi tải giỏ hàng" });
  }
}

/* ================= ADD TO CART ================= */
export async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;

    // kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    // kiểm tra tồn kho
    if (product.stock < quantity) {
      return res.status(400).json({ error: "Số lượng tồn kho không đủ" });
    }

    let cart = await Cart.findOne({ clerkId: req.user.clerkId });

    if (!cart) {
      const user = req.user;

      cart = await Cart.create({
        user: user._id,
        clerkId: user.clerkId,
        items: [],
      });
    }

    // kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;

      if (product.stock < newQuantity) {
        return res.status(400).json({ error: "Số lượng tồn kho không đủ" });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res.status(200).json({
      message: "Đã thêm sản phẩm vào giỏ hàng",
      cart,
    });
  } catch (error) {
    console.error("Error in addToCart controller:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi thêm vào giỏ hàng" });
  }
}

/* ================= UPDATE CART ITEM ================= */
export async function updateCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        error: "Số lượng phải lớn hơn hoặc bằng 1",
      });
    }

    const cart = await Cart.findOne({ clerkId: req.user.clerkId });
    if (!cart) {
      return res.status(404).json({ error: "Không tìm thấy giỏ hàng" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        error: "Sản phẩm không tồn tại trong giỏ hàng",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        error: "Số lượng tồn kho không đủ",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "Cập nhật giỏ hàng thành công",
      cart,
    });
  } catch (error) {
    console.error("Error in updateCartItem controller:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi cập nhật giỏ hàng" });
  }
}

/* ================= REMOVE FROM CART ================= */
export async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ clerkId: req.user.clerkId });
    if (!cart) {
      return res.status(404).json({ error: "Không tìm thấy giỏ hàng" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      cart,
    });
  } catch (error) {
    console.error("Error in removeFromCart controller:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi xóa sản phẩm" });
  }
}

/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ clerkId: req.user.clerkId });
    if (!cart) {
      return res.status(404).json({ error: "Không tìm thấy giỏ hàng" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Đã làm trống giỏ hàng",
      cart,
    });
  } catch (error) {
    console.error("Error in clearCart controller:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi làm trống giỏ hàng" });
  }
};