import { View, Text } from "react-native";

export default function ChatBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <View
      className={`max-w-[80%] px-4 py-3 rounded-2xl mb-2
        ${isUser
          ? "self-end bg-primary"
          : "self-start bg-surface"
        }`}
    >
      <Text
        className={`text-sm leading-5
          ${isUser ? "text-white" : "text-text-primary"}
        `}
      >
        {content}
      </Text>
    </View>
  );
}
