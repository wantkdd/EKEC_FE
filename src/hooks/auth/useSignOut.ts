import { logger } from "../../utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signOutApi } from "../../apis/auth";
import type { ResponseSignOut } from "../../types/auth/types";
import { useAuthStore } from "../../store/useAuthStore";
import { showError } from "../../utils/toast";

export const useSignOut = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  return useMutation<ResponseSignOut, Error>({
    mutationFn: signOutApi,
    onMutate: () => {
      setUser(null);
      setStatus("unauthenticated");
      queryClient.clear();
    },
    onSuccess: (response) => {
      logger.debug("로그아웃 응답", { response });

      if (response.resultType === "SUCCESS") {
        localStorage.clear();
        sessionStorage.clear();

        navigate("/");
      } else {
        logger.error("로그아웃 실패", undefined, { error: response.error });
        showError(response.error?.reason || "로그아웃에 실패했습니다.");
      }
    },
    onError: (error) => {
      logger.error("로그아웃 오류", error);
      showError("로그아웃 중 오류가 발생했습니다.");
    },
  });
};
