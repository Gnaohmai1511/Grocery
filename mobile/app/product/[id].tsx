import SafeScreen from "@/components/SafeScreen";
import useCart from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { useComments, useCreateComment } from "@/hooks/useComments";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();

  const {
    isInWishlist,
    toggleWishlist,
    isAddingToWishlist,
    isRemovingFromWishlist,
  } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const productId = id as string;

  const { data: comments } = useComments(productId);
  const { mutate: createComment, isPending } = useCreateComment(productId);
  const [comment, setComment] = useState("");

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      { productId: product._id, quantity },
      {
        onSuccess: () =>
          Alert.alert("Thành công", `${product.name} đã được thêm vào giỏ hàng`),
        onError: (error: any) => {
          Alert.alert(
            "Lỗi",
            error?.response?.data?.error || "Không thể thêm vào giỏ hàng"
          );
        },
      }
    );
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) return;

    createComment(comment, {
      onSuccess: () => {
        setComment("");
        Alert.alert("Thành công", "Đã đăng bình luận");
      },
      onError: (err: any) => {
        Alert.alert(
          "Lỗi",
          err?.response?.data?.message ||
            "Bạn cần mua sản phẩm trước khi bình luận"
        );
      },
    });
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = product.stock > 0;

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* HEADER */}
        <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-20 pb-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="bg-black/50 w-12 h-12 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isInWishlist(product._id)
                ? "bg-primary"
                : "bg-black/50"
            }`}
            onPress={() => toggleWishlist(product._id)}
            disabled={isAddingToWishlist || isRemovingFromWishlist}
          >
            {isAddingToWishlist || isRemovingFromWishlist ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={
                  isInWishlist(product._id) ? "heart" : "heart-outline"
                }
                size={24}
                color={
                  isInWishlist(product._id) ? "#E53935" : "#FFFFFF"
                }
              />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* IMAGE GALLERY */}
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / width
                );
                setSelectedImageIndex(index);
              }}
            >
              {product.images.map((image: string, index: number) => (
                <View key={index} style={{ width }}>
                  <Image
                    source={image}
                    style={{ width, height: 400 }}
                    contentFit="cover"
                  />
                </View>
              ))}
            </ScrollView>

            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {product.images.map((_: any, index: number) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === selectedImageIndex
                      ? "bg-primary w-6"
                      : "bg-white/50 w-2"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* PRODUCT INFO */}
          <View className="p-6">
            <View className="mb-3">
              <View className="bg-primary/20 px-3 py-1 rounded-full self-start">
                <Text className="text-primary text-xs font-bold">
                  {product.category}
                </Text>
              </View>
            </View>

            <Text className="text-text-primary text-3xl font-bold mb-3">
              {product.name}
            </Text>

            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center bg-surface px-3 py-2 rounded-full">
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text className="text-text-primary font-bold ml-1 mr-2">
                  {product.averageRating.toFixed(1)}
                </Text>
                <Text className="text-text-secondary text-sm">
                  ({product.totalReviews} đánh giá)
                </Text>
              </View>

              {inStock ? (
                <View className="ml-3 flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-500 font-semibold text-sm">
                    Còn {product.stock} sản phẩm
                  </Text>
                </View>
              ) : (
                <View className="ml-3 flex-row items-center">
                  <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  <Text className="text-red-500 font-semibold text-sm">
                    Hết hàng
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-primary text-4xl font-bold mb-6">
              ${product.price.toFixed(2)}
            </Text>

            {/* Quantity */}
            <View className="mb-6">
              <Text className="text-text-primary text-lg font-bold mb-3">
                Số lượng
              </Text>

              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-surface rounded-full w-12 h-12 items-center justify-center"
                  onPress={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  disabled={!inStock}
                >
                  <Ionicons name="remove" size={24} />
                </TouchableOpacity>

                <Text className="text-text-primary text-xl font-bold mx-6">
                  {quantity}
                </Text>

                <TouchableOpacity
                  className="bg-primary rounded-full w-12 h-12 items-center justify-center"
                  onPress={() =>
                    setQuantity(
                      Math.min(product.stock, quantity + 1)
                    )
                  }
                  disabled={!inStock || quantity >= product.stock}
                >
                  <Ionicons name="add" size={24} />
                </TouchableOpacity>
              </View>

              {quantity >= product.stock && inStock && (
                <Text className="text-orange-500 text-sm mt-2">
                  Đã đạt số lượng tối đa trong kho
                </Text>
              )}
            </View>

            {/* Description */}
            <View className="mb-8">
              <Text className="text-text-primary text-lg font-bold mb-3">
                Mô tả sản phẩm
              </Text>
              <Text className="text-text-secondary leading-6">
                {product.description}
              </Text>
            </View>

            {/* COMMENTS */}
            <View className="pb-10">
              <Text className="text-text-primary text-lg font-bold mb-3">
                Bình luận
              </Text>

              <View className="bg-surface rounded-xl p-3 mb-4">
                <TextInput
                  placeholder="Viết bình luận..."
                  placeholderTextColor="#888"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  className="text-text-primary"
                />
                <TouchableOpacity
                  className="bg-primary rounded-xl py-2 mt-3 items-center"
                  onPress={handleSubmitComment}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator color="#121212" />
                  ) : (
                    <Text className="text-background font-bold">
                      Đăng
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {comments?.length ? (
                comments.map((c: any) => (
                  <View
                    key={c._id}
                    className="bg-surface rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="w-9 h-9 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-primary font-bold">
                          {(c.user?.name || "U")[0]}
                        </Text>
                      </View>
                      <Text className="text-text-primary font-semibold">
                        {c.user?.name || "Người dùng"}
                      </Text>
                    </View>

                    <Text className="text-text-secondary leading-6">
                      {c.content}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-text-secondary text-center mt-4">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-surface px-6 py-4 pb-8">
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Text className="text-text-secondary text-sm mb-1">
                Tổng tiền
              </Text>
              <Text className="text-primary text-2xl font-bold">
                ${(product.price * quantity).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              className={`rounded-2xl px-8 py-4 flex-row items-center ${
                !inStock ? "bg-surface" : "bg-primary"
              }`}
              onPress={handleAddToCart}
              disabled={!inStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Ionicons name="cart" size={24} />
                  <Text className="font-bold text-lg ml-2">
                    {!inStock ? "Hết hàng" : "Thêm vào giỏ"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Không tìm thấy sản phẩm
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Sản phẩm có thể đã bị xoá hoặc không tồn tại
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold">
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#C8A165" />
        <Text className="text-text-secondary mt-4">
          Đang tải sản phẩm...
        </Text>
      </View>
    </SafeScreen>
  );
}