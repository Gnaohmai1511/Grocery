import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useState } from "react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View className="flex-row items-center p-3 bg-surface border-t border-background-light">
      <TextInput
        className="flex-1 px-4 py-3 rounded-full bg-background-light text-text-primary"
        placeholder="Ask me anything..."
        placeholderTextColor="#9C8A7E"
        value={text}
        onChangeText={setText}
        editable={!disabled}
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled}
        className="ml-2 px-4 py-3 rounded-full bg-primary"
      >
        <Text className="text-white font-semibold">Send</Text>
      </TouchableOpacity>
    </View>
  );
}
