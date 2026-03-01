import { View, Text } from "react-native";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export default function OrderSummary({
  subtotal,
  shipping,
  discount,
  total,
}: OrderSummaryProps) {
  return (
    <View className="px-6 mt-6">
      <View className="bg-surface rounded-3xl p-5">
        <Text className="text-text-primary text-xl font-bold mb-4">
          Tóm tắt đơn hàng
        </Text>

        <View className="space-y-3">
          {/* Tạm tính */}
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base">Tạm tính</Text>
            <Text className="text-text-primary font-semibold text-base">
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          {/* Phí vận chuyển */}
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base">
              Phí vận chuyển
            </Text>
            <Text className="text-text-primary font-semibold text-base">
              ${shipping.toFixed(2)}
            </Text>
          </View>

          {/* Giảm giá */}
          {discount > 0 && (
            <View className="flex-row justify-between items-center">
              <Text className="text-green-500 text-base font-medium">
                Giảm giá
              </Text>
              <Text className="text-green-500 font-semibold text-base">
                -${discount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View className="border-t border-background-lighter pt-3 mt-1" />

          {/* Tổng cộng */}
          <View className="flex-row justify-between items-center">
            <Text className="text-text-primary font-bold text-lg">
              Tổng cộng
            </Text>
            <Text className="text-primary font-bold text-2xl">
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}