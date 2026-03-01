import { useApi } from "@/lib/api";

export const useCommentApi = () => {
  const api = useApi();

  return {
    getCommentsByProduct: (productId: string) =>
      api.get(`/comments/product/${productId}`),

    createComment: (data: { productId: string; content: string }) =>
      api.post("/comments", data),
  };
};