import { useApi } from "@/lib/api";
export const useAIService = () => {
  const api = useApi();

  const askAI = async ({
    prompt,
    clerkId,
    chatId,
  }: {
    prompt: string;
    clerkId: string;
    chatId?: string;
  }) => {
    const res = await api.post("/ai/ask", {
      prompt,
      clerkId,
      chatId,
    });

    return res.data;
  };

  const getHistory = async (clerkId: string) => {
    const res = await api.get(`/ai/history/${clerkId}`);
    return res.data;
  };

  return { askAI, getHistory };
};
