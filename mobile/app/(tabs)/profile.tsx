import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";

import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { FlatList } from "react-native";

const MENU_ITEMS = [
  { id: 1, icon: "list-outline", title: "Orders", color: "#10B981", action: "/orders" },
  { id: 2, icon: "location-outline", title: "Addresses", color: "#F59E0B", action: "/addresses" },
  { id: 3, icon: "heart-outline", title: "Wishlist", color: "#EF4444", action: "/wishlist" },
] as const;

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleMenuPress = (action: (typeof MENU_ITEMS)[number]["action"]) => {
     router.push(action);
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View className="px-6 pb-8">
          <View className="bg-surface rounded-3xl p-6">
            <View className="flex-row items-center">
              <View className="relative">
                <Image
                  source={user?.imageUrl}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  transition={200}
                />
              </View>

              <View className="flex-1 ml-8 mr-2">
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-text-secondary text-sm mr-2">
                  {user?.emailAddresses?.[0]?.emailAddress || "No email"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* MENU ITEMS */}
        <View className="mx-6 mt-4 mb-3">
          <FlatList
            data={MENU_ITEMS}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item, index }) => {
              const isLastItem = index === MENU_ITEMS.length - 1;
              const isOdd = MENU_ITEMS.length % 2 === 1;

              const isFullWidth = isLastItem && isOdd;

              return (
                <TouchableOpacity
                  className="bg-surface rounded-2xl p-6 items-center justify-center mb-3"
                  style={{ width: isFullWidth ? "100%" : "48%" }}
                  activeOpacity={0.7}
                  onPress={() => handleMenuPress(item.action)}
                >
                  <View
                    className="rounded-full w-16 h-16 items-center justify-center mb-4"
                    style={{ backgroundColor: item.color + "20" }}
                  >
                    <Ionicons name={item.icon} size={28} color={item.color} />
                  </View>

                  <Text className="text-text-primary font-bold text-base">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* SIGNOUT BTN */}
        <TouchableOpacity
          className="mx-6 mb-3 bg-surface rounded-2xl py-5 flex-row items-center justify-center border-2 border-red-500/20"
          activeOpacity={0.8}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;
