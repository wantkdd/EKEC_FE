import { logger } from "../../utils/logger";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signInApi, refreshApi } from "../../apis/auth";
import type { RequestSign, ResponseSign } from "../../types/auth/types";
import { useAuthStore } from "../../store/useAuthStore";
import { useErrorModal } from "./useErrorModal";
import { authMeta } from "../../utils/authMeta";
import { showError } from "../../utils/toast";

export const useSignIn = () => {
  const navigate = useNavigate();
  const { showSignUpPromptModal, showPasswordErrorModal } = useErrorModal();
  const { setUser, setStatus, loadAvatar } = useAuthStore();

  return useMutation<ResponseSign, Error, RequestSign>({
    mutationFn: signInApi,
    onSuccess: async (response) => {
      if (response.resultType === "SUCCESS") {
        try {
          // 쿠키 설정을 위한 짧은 대기
          await new Promise((resolve) => setTimeout(resolve, 100));

          // 사용자 정보 새로고침
          const userResponse = await refreshApi();

          if (userResponse.resultType === "SUCCESS" && userResponse.data) {
            setUser(userResponse.data);
            setStatus("authenticated");
            authMeta.setLastLoginAt(Date.now());

            // 세션 활성화 플래그 설정
            try {
              sessionStorage.setItem("auth:live", "1");
            } catch {}

            await loadAvatar();

            // 프로필 완성 여부에 따른 라우팅
            if (response.data?.isCompleted) {
              navigate("/");
            } else {
              navigate("/createProfile");
            }
          } else {
            throw new Error("Failed to get user info");
          }
        } catch (error) {
          logger.error("Post-login user fetch failed", error);

          // refreshApi 실패 시, 로그인 응답에서 받은 데이터로라도 처리
          if (response.data) {
            // 기본 사용자 정보 설정 (refreshApi 응답과 같은 구조로 가정)
            const userData = {
              id: response.data.id,
              email: response.data.email,
              name: response.data.name,
              nickname: response.data.nickname,
              profileImage: response.data.profileImage || "",
              isCompleted: response.data.isCompleted,
              gender: 0, // 기본값 (로그인 응답에는 없으므로)
              phone: "", // 기본값 (로그인 응답에는 없으므로)
              birth: "", // 기본값 (로그인 응답에는 없으므로)
              defaultImage: false, // 기본값 (로그인 응답에는 없으므로)
            };
            setUser(userData);
            setStatus("authenticated");
            authMeta.setLastLoginAt(Date.now());

            // 세션 활성화 플래그 설정
            try {
              sessionStorage.setItem("auth:live", "1");
            } catch {}

            // 프로필 완성 여부에 따른 라우팅
            if (response.data.isCompleted) {
              navigate("/");
            } else {
              navigate("/createProfile");
            }
            return;
          }

          setUser(null);
          setStatus("unauthenticated");
          throw error;
        }
      } else {
        throw new Error(response.error?.reason || "로그인에 실패했습니다.");
      }
    },

    onError: (error: unknown) => {
      logger.error("로그인 오류", error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: { errorCode?: string } } } };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;

        if (status === 404) {
          showSignUpPromptModal();
          return;
        } else if (status === 400 && errorData?.error?.errorCode === "I001") {
          showPasswordErrorModal();
          return;
        }
      }

      showError("로그인 중 오류가 발생했습니다.");
    },
  });
};
