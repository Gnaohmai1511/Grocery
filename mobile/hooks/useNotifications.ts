import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";

export default function useNotifications() {
  const api = useApi();
  const { userId, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["notifications", userId],
    enabled: isLoaded && isSignedIn && !!userId,
    queryFn: async () => {
      const res = await api.get("/notifications", {
        headers: {
          "x-clerk-id": userId, // 👈 gửi lên backend
        },
      });
      return res.data;
    },
  });
}