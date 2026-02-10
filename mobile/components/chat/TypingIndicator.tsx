import { View, Text } from "react-native";

export default function TypingIndicator() {
  return (
    <View className="self-start bg-surface px-4 py-2 rounded-2xl mb-2">
      <Text className="text-text-tertiary text-sm">
        Answering...
      </Text>
    </View>
  );
}
