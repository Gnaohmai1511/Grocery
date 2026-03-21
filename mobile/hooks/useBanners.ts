import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export default function useBanners() {
  const api = useApi();

  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await api.get("/banners");
      return data;
    },
  });
}