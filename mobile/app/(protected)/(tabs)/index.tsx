import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";
import useNotifications from "@/hooks/useNotifications";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { useRouter } from "expo-router";
import { Modal } from "react-native";
const CATEGORIES = [
  { name: "All", icon: "grid-outline" as const },
  { name: "Electronics", image: require("@/assets/images/electronics.png") },
  { name: "Fashion", image: require("@/assets/images/fashion.png") },
  { name: "Sports", image: require("@/assets/images/sports.png") },
  { name: "Books", image: require("@/assets/images/books.png") },
];
const router = useRouter();
const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const { data: notificationData } = useNotifications();
  const unreadCount = notificationData?.unreadCount || 0;
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = useMemo(() => {
  if (!products) return [];

  let filtered = products;

  // filter by category
  if (selectedCategory !== "All") {
    filtered = filtered.filter(
      (product) => product.category === selectedCategory
    );
  }

  // filter by search
  if (searchQuery.trim()) {
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // filter by price
  if (minPrice !== null) {
    filtered = filtered.filter((product) => product.price >= minPrice);
  }

  if (maxPrice !== null) {
    filtered = filtered.filter((product) => product.price <= maxPrice);
  }

  // filter by rating
  if (minRating !== null) {
    filtered = filtered.filter(
      (product) => product.averageRating >= minRating
    );
  }

  return filtered;
}, [products, selectedCategory, searchQuery, minPrice, maxPrice, minRating]);
const resetFilters = () => {
  setMinPrice(null);
  setMaxPrice(null);
  setMinRating(null);
};
  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Shop</Text>
              <Text className="text-text-secondary text-sm mt-1">Browse all products</Text>
            </View>
          <View className="flex-row items-center gap-3">
  {/* NOTIFICATION */}
  <TouchableOpacity
    onPress={() => router.push("/notifications")}
    activeOpacity={0.7}
    className="relative bg-surface/50 p-3 rounded-full"
  >
    <Ionicons name="notifications-outline" size={22} color="#C8A165" />

    {unreadCount > 0 && (
      <View className="absolute -top-1 -right-1 bg-red-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
        <Text className="text-white text-[10px] font-bold">
          {unreadCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>

  {/* FILTER */}
  <TouchableOpacity
    className="bg-surface/50 p-3 rounded-full"
    activeOpacity={0.7}
    onPress={() => setIsFilterVisible(true)}
  >
    <Ionicons name="options-outline" size={22} color={"#C8A165"} />
  </TouchableOpacity>
</View>
          </View>

          {/* SEARCH BAR */}
          <View className="bg-surface flex-row items-center px-5 py-4 rounded-2xl">
            <Ionicons color={"#666"} size={22} name="search" />
            <TextInput
              placeholder="Search for products"
              placeholderTextColor={"#666"}
              className="flex-1 ml-3 text-base text-text-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* CATEGORY FILTER */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${isSelected ? "bg-primary" : "bg-surface"}`}
                >
                  {category.icon ? (
                    <Ionicons
                      name={category.icon}
                      size={36}
                      color={isSelected ? "#fff" : "#121212"}
                    />
                  ) : (
                    <Image source={category.image} className="size-12" resizeMode="contain" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">Products</Text>
            <Text className="text-text-secondary text-sm">{filteredProducts.length} items</Text>
          </View>

          {/* PRODUCTS GRID */}
          <ProductsGrid products={filteredProducts} isLoading={isLoading} isError={isError} />
        </View>
        <Modal
  visible={isFilterVisible}
  animationType="slide"
  transparent
>
  {/* Overlay */}
  <View className="flex-1 bg-black/40 justify-end">
    {/* Modal Content */}
    <View className="bg-background rounded-t-3xl p-6">
      
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold">Filters</Text>
        <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
          <Ionicons name="close" size={24} />
        </TouchableOpacity>
      </View>

      {/* PRICE FILTER */}
      <Text className="font-semibold mb-2">Price</Text>
      <View className="flex-row flex-wrap mb-4">
        <TouchableOpacity
          onPress={() => {
            setMinPrice(null);
            setMaxPrice(null);
          }}
          className="bg-surface px-4 py-2 rounded-full mr-2 mb-2"
        >
          <Text>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMinPrice(null);
            setMaxPrice(100);
          }}
          className="bg-surface px-4 py-2 rounded-full mr-2 mb-2"
        >
          <Text>{'< 100$'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMinPrice(100);
            setMaxPrice(500);
          }}
          className="bg-surface px-4 py-2 rounded-full mr-2 mb-2"
        >
          <Text>100$ – 500$</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMinPrice(500);
            setMaxPrice(null);
          }}
          className="bg-surface px-4 py-2 rounded-full mb-2"
        >
          <Text>{'> 500$'}</Text>
        </TouchableOpacity>
      </View>

      {/* RATING FILTER */}
      <Text className="font-semibold mb-2">Rating</Text>
      <View className="flex-row mb-6">
        {[1,2,3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            onPress={() => setMinRating(rating)}
            className="bg-surface px-4 py-2 rounded-full mr-2 flex-row items-center"
          >
            <Ionicons name="star" size={16} color="#F5A623" />
            <Text className="ml-1">{rating}+</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ACTION BUTTONS */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={resetFilters}
          className="flex-1 bg-surface py-3 rounded-xl mr-3 items-center"
        >
          <Text>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsFilterVisible(false)}
          className="flex-1 bg-primary py-3 rounded-xl items-center"
        >
          <Text className="text-white font-semibold">Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;