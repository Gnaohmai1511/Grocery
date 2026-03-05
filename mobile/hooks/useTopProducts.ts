import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Product } from "@/types";

export default function useTopProducts() {
  const api = useApi();

  return useQuery<Product[]>({
    queryKey: ["topProducts"],
    queryFn: async () => {
      const res = await api.get("/products/top");
      return res.data;
    },
  });
}