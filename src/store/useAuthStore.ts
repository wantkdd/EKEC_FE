import { create } from "zustand";
import { logger } from "../utils/logger";
import { persist } from "zustand/middleware";
import { refreshApi, signOutApi } from "../apis/auth";
import type { ResponseRefresh } from "../types/auth/types";
import { authMeta, REFRESH_TTL_MS } from "../utils/authMeta";

const FORCE_LOGOUT_ON_MODAL =
  import.meta.env.VITE_FORCE_LOGOUT_ON_MODAL === "true";

type LogoutReason = "expired" | "revoked" | null;
type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
type User = NonNullable<ResponseRefresh["data"]>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthState {
  user: User | null;
  status: AuthStatus;
  avatarUrl: string | null;
  showSessionModal: boolean;
  logoutReason: LogoutReason;

  setUser: (u: User | null) => void;
  setStatus: (s: AuthStatus) => void;
  setSessionModal: (open: boolean, reason: LogoutReason) => void;

  initAuth: () => Promise<void>;
  forceLogout: () => void;
  loadAvatar: () => Promise<void>;
  cleanupAndLogout: () => void;
  handleAuthError: (error: any, isFromApiCall?: boolean) => void;
}

// 헬퍼 함수들 (store 외부에서도 사용 가능)
function shouldTreatAsExpiredSession(): boolean {
  if (authMeta.hasAuthEver()) return true;

  try {
    if (sessionStorage.getItem("auth:live") === "1") return true;
  } catch {}

  try {
    const persistedData = localStorage.getItem("auth");
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      if (parsed?.state?.user) return true;
    }
  } catch {}

  return false;
}
function determineLogoutReason(error: any): "expired" | "revoked" {
  const code = error?.response?.data?.code;

  // 서버에서 명시적으로 중복로그인/세션충돌을 알려주는 경우
  if (code === "REFRESH_REVOKED" || code === "SESSION_CONFLICT") {
    return "revoked";
  }

  // 서버에서 명시적으로 만료를 알려주는 경우
  if (code === "REFRESH_EXPIRED") {
    return "expired";
  }

  // 서버 응답 코드가 없거나 다른 경우, 시간 기반으로 판단
  const lastSuccess = authMeta.getLastRefreshSuccessAt();
  const lastLogin = authMeta.getLastLoginAt(); // 추가: 마지막 로그인 시각

  // refresh 성공 기록이 있는 경우 - 그 시간 기준으로 판단
  if (lastSuccess) {
    const timeDiff = Date.now() - lastSuccess;

    if (timeDiff > REFRESH_TTL_MS) {
      return "expired";
    } else {
      return "revoked";
    }
  }

  // refresh 성공 기록이 없지만 로그인 기록이 있는 경우 - 로그인 시간 기준으로 판단
  if (lastLogin) {
    const timeDiff = Date.now() - lastLogin;

    if (timeDiff > REFRESH_TTL_MS) {
      return "expired";
    } else {
      return "revoked";
    }
  }

  // 아무 기록이 없는 경우 - 기본적으로 expired로 처리
  // (오래된 세션이거나 기록이 손실된 경우)

  return "expired";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      avatarUrl: null,
      showSessionModal: false,
      logoutReason: null,

      setUser: (u) => set({ user: u }),
      setStatus: (s) => set({ status: s }),
      setSessionModal: (open, reason) =>
        set({ showSessionModal: open, logoutReason: reason }),

      initAuth: async () => {
        set({ status: "loading" });

        try {
          const response = await refreshApi();

          if (response.resultType === "SUCCESS" && response.data) {
            set({ user: response.data, status: "authenticated" });
            await get().loadAvatar();
            return;
          }

          get().cleanupAndLogout();
        } catch (error) {
          logger.error("Auth initialization failed:", error);

          const hadSession = shouldTreatAsExpiredSession();

          // 세션이 없었던 경우 조용히 로그아웃 (콜드 부팅)
          if (!hadSession) {
            get().cleanupAndLogout();
            return;
          }

          // ✅ 세션이 있었지만 initAuth에서 실패하는 경우:
          // 대부분 자연스러운 세션 만료이므로 조용히 처리
          // 단, 매우 최근에 활동했던 경우만 모달 표시

          const lastActivity = Math.max(
            authMeta.getLastRefreshSuccessAt() || 0,
            authMeta.getLastLoginAt() || 0
          );

          if (lastActivity) {
            const timeSinceLastActivity = Date.now() - lastActivity;

            // 5분 이내에 활동했던 경우만 모달 표시 (중복로그인 가능성)
            const RECENT_ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5분

            if (timeSinceLastActivity < RECENT_ACTIVITY_THRESHOLD) {
              const reason = determineLogoutReason(error);
              get().cleanupAndLogout();
              get().setSessionModal(true, reason);
              return;
            }
          }

          // 자연스러운 세션 만료로 판단 - 조용히 처리

          get().cleanupAndLogout();
        }
      },

      // API 호출 시 인증 오류 처리 (apiClient 인터셉터에서 사용)
      // handleAuthError 메서드만 수정된 부분
      handleAuthError: (error: any, isFromApiCall = true) => {
        const hadSession = shouldTreatAsExpiredSession();

        // 세션이 없었던 경우 조용히 로그아웃 (콜드 부팅)
        if (!hadSession) {
          get().cleanupAndLogout();
          return;
        }

        // 초기화 중 오류는 모달 표시하지 않음
        if (!isFromApiCall) {
          get().cleanupAndLogout();
          return;
        }

        // 실제 API 호출에서 발생한 인증 오류 - 만료/중복로그인 판단
        const reason = determineLogoutReason(error);

        // 강제 로그아웃 설정이 켜져있으면 서버에도 로그아웃 요청
        if (FORCE_LOGOUT_ON_MODAL) {
          signOutApi().catch((err) => logger.warn("signOutApi failed", err));
        }

        // 상태 정리
        get().cleanupAndLogout();

        // 중복로그인/세션만료 모달 표시 (최우선)

        // 세션 모달을 먼저 표시하고, 다른 모달들이 표시되지 않도록 함
        get().setSessionModal(true, reason);
      },
      forceLogout: () => {
        get().cleanupAndLogout();
      },

      // 내부 헬퍼 메서드
      cleanupAndLogout: () => {
        // 아바타 URL 정리
        const prev = get().avatarUrl;
        if (prev) URL.revokeObjectURL(prev);

        // 세션 플래그 정리
        try {
          sessionStorage.removeItem("auth:live");
        } catch {}

        // 메타 정보 정리
        authMeta.clearLastRefreshSuccessAt();

        // 상태 초기화
        set({
          user: null,
          status: "unauthenticated",
          avatarUrl: null,
        });
      },

      loadAvatar: async () => {
        const fileName = get().user?.profileImage;
        if (!fileName?.trim()) {
          const prev = get().avatarUrl;
          if (prev) URL.revokeObjectURL(prev);
          set({ avatarUrl: null });
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE_URL}/image?type=1&fileName=${fileName}`,
            {
              credentials: "include",
            }
          );

          if (!response.ok) throw new Error("Failed to load avatar");

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          const prev = get().avatarUrl;
          if (prev) URL.revokeObjectURL(prev);

          set({ avatarUrl: objectUrl });
        } catch (error) {
          logger.error("Avatar load failed:", error);
          const prev = get().avatarUrl;
          if (prev) URL.revokeObjectURL(prev);
          set({ avatarUrl: null });
        }
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({
        user: state.user,
        status: state.status,
      }),
    }
  )
);
