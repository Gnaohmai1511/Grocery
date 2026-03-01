import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export function useComments(productId?: string) {
  const api = useApi();

  return useQuery({
    queryKey: ["comments", productId],
    queryFn: async () => {
      const res = await api.get(`/comments/${productId}`);
      return res.data;
    },
    enabled: !!productId, // 👈 rất quan trọng
  });
}
export function useCreateComment(productId?: string) {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!productId) throw new Error("Missing productId");

      const res = await api.post("/comments", {
        productId,
        content,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", productId] });
    },
  });
}