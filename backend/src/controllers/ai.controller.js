import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { Chat } from "../models/chat.model.js";

export const askAI = async (req, res) => {
  try {
    const { prompt, clerkId, chatId } = req.body;

    console.log("ASK AI INPUT:", { prompt, clerkId, chatId });

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Thiếu câu hỏi" });
    }

    /* =========================
       LẤY DỮ LIỆU NGƯỜI DÙNG
    ========================= */
    const user = await User.findOne({ clerkId });
    const orders = await Order.find({ clerkId }).limit(3);
    const cart = await Cart.findOne({ clerkId }).populate("items.product");
    const newProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    /* =========================
       LẤY CHAT & LỊCH SỬ
    ========================= */
    let chat = null;
    let previousMessages = "";

    if (chatId) {
      chat = await Chat.findById(chatId);

      if (chat?.messages?.length) {
        previousMessages = chat.messages
          .slice(-10)
          .map((m) =>
            m.role === "user"
              ? `Người dùng: ${m.content}`
              : `AI: ${m.content}`
          )
          .join("\n");
      }
    }

   /* =========================
   TÌM SẢN PHẨM ĐÃ TƯ VẤN (FIX)
========================= */
let lastMentionedProduct = null;

if (chat?.messages?.length) {
  const products = await Product.find({}, "name price stock category description averageRating");

  for (let i = chat.messages.length - 1; i >= 0; i--) {
    const msg = chat.messages[i];

    if (msg.role !== "assistant") continue;

    for (const product of products) {
      if (
        msg.content.toLowerCase().includes(product.name.toLowerCase())
      ) {
        lastMentionedProduct = product;
        break;
      }
    }

    if (lastMentionedProduct) break;
  }
}

    /* =========================
       SYSTEM PROMPT
    ========================= */
    const systemPrompt = `
Bạn là AI chatbot của ứng dụng Ecommerce tên là "Grocery".

=== LUẬT BẮT BUỘC ===
1. Khi người dùng chào hỏi, hãy trả lời thân thiện và giới thiệu bạn là trợ lý ảo của Grocery.
2. CHỈ trả lời các câu hỏi liên quan đến:
   - Sản phẩm
   - Đơn hàng
   - Giỏ hàng
   - Thanh toán
   - Tài khoản người dùng
   - Khuyến mãi trong app Grocery

3. TUYỆT ĐỐI KHÔNG trả lời các chủ đề:
   - Lập trình
   - Toán học
   - Chính trị
   - Tôn giáo
   - Đời sống cá nhân
   - Kiến thức chung không liên quan Ecommerce

4. Nếu câu hỏi KHÔNG liên quan Grocery:
→ Trả lời đúng 1 câu:
"Mình chỉ có thể hỗ trợ các câu hỏi về sản phẩm, đơn hàng và mua sắm trong ứng dụng Grocery 🛒"

5. KHÔNG bịa thông tin. Chỉ dùng dữ liệu bên dưới.
6. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.

7. Nếu người dùng hỏi tiếp (ví dụ: "cái này", "sản phẩm đó", "mua cái lúc nãy"),
hãy dựa vào lịch sử hội thoại và sản phẩm đã tư vấn gần nhất để trả lời.

8. Nếu KHÔNG có sản phẩm trước đó mà người dùng hỏi mơ hồ,
hãy yêu cầu người dùng nói rõ tên sản phẩm.

=== THÔNG TIN NGƯỜI DÙNG ===
Email: ${user?.email || "Guest"}
Số đơn hàng gần đây: ${orders.length}
Số sản phẩm trong giỏ: ${cart?.items?.length || 0}

=== SẢN PHẨM MỚI ===
${newProducts.map((p) => `- ${p.name}: ${p.price}đ`).join("\n")}

=== SẢN PHẨM ĐÃ TƯ VẤN TRƯỚC ĐÓ ===
${
  lastMentionedProduct
    ? `
Tên: ${lastMentionedProduct.name}
Giá: ${lastMentionedProduct.price}đ
Danh mục: ${lastMentionedProduct.category}
Tồn kho: ${lastMentionedProduct.stock}
Đánh giá: ${lastMentionedProduct.averageRating}/5
Mô tả: ${lastMentionedProduct.description}
`
    : "Chưa có sản phẩm nào được tư vấn trước đó"
}

=== LỊCH SỬ HỘI THOẠI ===
${previousMessages || "Chưa có hội thoại trước đó"}

=== CÂU HỎI HIỆN TẠI ===
"${prompt}"
`;

    console.log("SYSTEM PROMPT:\n", systemPrompt);

    /* =========================
       GỌI GEMINI
    ========================= */
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(systemPrompt);
    const answer = result.response.text().trim();

    console.log("AI ANSWER:", answer);

    /* =========================
       LƯU CHAT
    ========================= */
    if (!chat) {
      chat = new Chat({
        user: user?._id,
        clerkId,
        title: prompt.slice(0, 30),
        messages: [],
      });
    }

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