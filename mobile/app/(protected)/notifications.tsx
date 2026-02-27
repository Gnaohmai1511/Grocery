import SafeScreen from "@/components/SafeScreen";
import useNotifications from "@/hooks/useNotifications";
import { useApi } from "@/lib/api";

import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";

const NotificationsScreen = () => {
  const api = useApi();
  const { data, isLoading, refetch } = useNotifications();
  const router = useRouter();

  const notifications = data?.notifications || [];

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  /** UI khi vuốt */
  const renderRightActions = () => (
    <View className="flex-1 bg-red-500 justify-center items-end pr-6 rounded-2xl">
      <Ionicons name="trash-outline" size={26} color="#fff" />
    </View>
  );

  const renderItem = ({ item }: any) => {
    const isUnread = !item.isRead;

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => deleteNotification(item._id)}
      >
        <TouchableOpacity
          onPress={() => markAsRead(item._id)}
          activeOpacity={0.8}
          className={`mb-4 p-4 rounded-2xl ${
            isUnread
              ? "bg-primary/10 border border-primary"
              : "bg-surface"
          }`}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                className={`text-base font-semibold ${
                  isUnread ? "text-primary" : "text-text-primary"
                }`}
              >
                {item.title}
              </Text>

              <Text className="text-text-secondary text-sm mt-1">
                {item.message}
              </Text>

              <Text className="text-text-secondary text-xs mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>

            {isUnread && (
              <View className="size-3 rounded-full bg-primary mt-1" />
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeScreen>
      <View className="flex-1 px-6 pt-6">
        {/* HEADER */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-full bg-primary/15"
          >
            <Ionicons name="arrow-back" size={22} color="#C8A165" />
          </TouchableOpacity>

          <Ionicons
            name="notifications-outline"
            size={26}
            color="#C8A165"
          />

          <Text className="ml-3 text-2xl font-bold text-text-primary">
            Notifications
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#C8A165" />
        ) : notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#999"
            />
            <Text className="text-text-secondary mt-4">
              No notifications yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeScreen>
  );
};

export default NotificationsScreen;