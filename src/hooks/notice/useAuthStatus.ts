// hooks/useAuthStatus.ts
import { useQuery } from "@tanstack/react-query";
import { privateAPI } from '../../apis/httpClient';

export const useAuthStatus = () => {
  return useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      try {
        const { data } = await privateAPI.get("/auth/me", {
          withCredentials: true,
        });
        return {
          isLoggedIn: data?.resultType === "SUCCESS",
          user: data?.data ?? null,
        };
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'response' in e) {
          const error = e as { response?: { status?: number } };
          if (error.response?.status === 401)
            return { isLoggedIn: false, user: null };
        }
        return { isLoggedIn: false, user: null };
      }
    },
    staleTime: 60_000,
    retry: false,
  });
};
