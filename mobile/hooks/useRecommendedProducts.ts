import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useRecommendedProducts = () => {
  const api = useApi();

  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["recommendedProducts"],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products/recommended');
      return data;
    },
  });

  return { data: data || [], isLoading, isError };
};

export default useRecommendedProducts;
