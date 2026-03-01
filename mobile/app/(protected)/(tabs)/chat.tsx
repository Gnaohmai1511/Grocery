import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";

import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useAIService } from "@/services/ai.service";
import SafeScreen from "@/components/SafeScreen";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const HEADER_HEIGHT = 56;

export default function ChatScreen() {
  const { user } = useUser();
  const { askAI } = useAIService();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>();

  const handleSend = async (text: string) => {
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await askAI({
        prompt: text,
        clerkId: user?.id!,
        chatId,
      });

      setChatId(res.chatId);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer },
      ]);
    } catch (error: any) {
      console.error("❌ LỖI CHAT AI (FULL):", error);
      console.error("❌ MESSAGE:", error?.message);
      console.error("❌ RESPONSE DATA:", error?.response?.data);
      console.error("❌ STATUS:", error?.response?.status);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      {/* ===== HEADER ===== */}
      <View
        style={{ height: 56 }}
        className="bg-background border-b border-background-light items-center justify-center"
      >
        <Text className="text-lg font-semibold text-text-primary">
          Trợ lý AI
        </Text>
      </View>

      {/* ===== CHAT BODY ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={HEADER_HEIGHT}
      >
        <View className="flex-1 bg-background">
          <FlatList
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <ChatBubble role={item.role} content={item.content} />
            )}
            ListFooterComponent={loading ? <TypingIndicator /> : null}
            keyboardShouldPersistTaps="handled"
          />

          <ChatInput onSend={handleSend} disabled={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}