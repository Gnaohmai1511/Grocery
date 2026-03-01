import { Product } from "../models/product.model.js";

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