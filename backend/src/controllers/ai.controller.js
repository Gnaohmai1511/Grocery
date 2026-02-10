import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { Chat } from "../models/chat.model.js";

export const askAI = async (req, res) => {
  try {
    const { prompt, clerkId, chatId } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Thiếu câu hỏi" });
    }

    // 1️⃣ Lấy dữ liệu user
    const user = await User.findOne({ clerkId });
    const orders = await Order.find({ clerkId }).limit(3);
    const cart = await Cart.findOne({ clerkId }).populate("items.product");
    const newProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // 2️⃣ SYSTEM PROMPT – CHỐNG LẠC ĐỀ
    const systemPrompt = `
Bạn là AI chatbot của ứng dụng Ecommerce tên là "Grocery".

=== LUẬT BẮT BUỘC ===
1. CHỈ trả lời các câu hỏi liên quan đến:
   - Sản phẩm
   - Đơn hàng
   - Giỏ hàng
   - Thanh toán
   - Tài khoản người dùng
   - Khuyến mãi trong app Grocery

2. TUYỆT ĐỐI KHÔNG trả lời các chủ đề:
   - Lập trình
   - Toán học
   - Chính trị
   - Tôn giáo
   - Đời sống cá nhân
   - Kiến thức chung không liên quan Ecommerce

3. Nếu câu hỏi KHÔNG liên quan Grocery:
   → Trả lời đúng 1 câu:
   "Mình chỉ có thể hỗ trợ các câu hỏi về sản phẩm, đơn hàng và mua sắm trong ứng dụng Grocery 🛒"

4. KHÔNG bịa thông tin. Chỉ dùng dữ liệu bên dưới.
5. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.

=== THÔNG TIN NGƯỜI DÙNG ===
Email: ${user?.email || "Guest"}
Số đơn hàng gần đây: ${orders.length}
Số sản phẩm trong giỏ: ${cart?.items.length || 0}

=== SẢN PHẨM MỚI ===
${newProducts.map(p => `- ${p.name}: ${p.price}đ`).join("\n")}

=== CÂU HỎI NGƯỜI DÙNG ===
"${prompt}"
`;

    // 3️⃣ Gọi Gemini (MODEL ĐÚNG)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(systemPrompt);
    const answer = result.response.text().trim();

    // 4️⃣ Lưu lịch sử chat
    const chat = chatId
      ? await Chat.findById(chatId)
      : new Chat({
          user: user?._id,
          clerkId,
          title: prompt.slice(0, 30),
        });

    chat.messages.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer }
    );

    await chat.save();

    res.json({
      answer,
      chatId: chat._id,
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI không phản hồi" });
  }
};
