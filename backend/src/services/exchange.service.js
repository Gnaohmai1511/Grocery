// Service để lấy tỉ giá tiền tệ từ API
let cachedRate = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // Cache trong 1 giờ (miliseconds)

/**
 * Lấy tỉ giá USD sang VND từ API
 * Trả về số VND tương ứng với 1 USD
 * Cache kết quả trong 1 giờ để tránh gọi API quá nhiều
 */
export async function getUSDtoVNDRate() {
  try {
    // Kiểm tra cache
    if (cachedRate && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log("✅ Sử dụng tỉ giá từ cache:", cachedRate);
      return cachedRate;
    }

    // Gọi API để lấy tỉ giá thực tế
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const vndRate = data.rates?.VND;

    if (!vndRate) {
      throw new Error("Không thể lấy tỉ giá VND từ API");
    }

    // Cập nhật cache
    cachedRate = vndRate;
    cacheTimestamp = Date.now();

    console.log("✅ Lấy tỉ giá mới từ API: 1 USD =", vndRate, "VND");
    return vndRate;
  } catch (error) {
    console.error("❌ Lỗi lấy tỉ giá từ API:", error.message);
    
    // Nếu API fail, sử dụng tỉ giá mặc định
    const DEFAULT_RATE = 23500;
    console.log("⚠️ Sử dụng tỉ giá mặc định: 1 USD =", DEFAULT_RATE, "VND");
    return DEFAULT_RATE;
  }
}

/**
 * Chuyển đổi số tiền từ VND sang USD
 * Ví dụ: convertVNDtoUSD(235000) = 10 (USD)
 */
export async function convertVNDtoUSD(amountVND) {
  const rate = await getUSDtoVNDRate();
  return amountVND / rate;
}

/**
 * Chuyển đổi số tiền từ USD sang VND
 * Ví dụ: convertUSDtoVND(10) = 235000 (VND)
 */
export async function convertUSDtoVND(amountUSD) {
  const rate = await getUSDtoVNDRate();
  return amountUSD * rate;
}
