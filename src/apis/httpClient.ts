/**
 * 통합 HTTP 클라이언트
 *
 * 이 파일은 프로젝트의 모든 API 요청을 위한 단일 HTTP 클라이언트를 제공합니다.
 * - API: 공개 API (인증 불필요)
 * - privateAPI: 인증이 필요한 API
 * - authApi: 인증 관련 API (회원가입, 로그인, 로그아웃, 토큰 갱신)
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 공개 API - 인증이 필요 없는 요청
export const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 10000,
});

// 인증 API - 회원가입, 로그인, 로그아웃, 토큰 갱신
export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 10000,
});

// 인증이 필요한 API
export const privateAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 10000,
});

// 토큰 갱신 API 호출 함수
async function refreshAccessToken(): Promise<void> {
  const response = await authApi.post("/auth/refresh");

  if (response.status >= 200 && response.status < 300) {
    // 세션 활성화 플래그
    try {
      sessionStorage.setItem("auth:live", "1");
    } catch (e) {
      // sessionStorage 접근 실패 무시
    }
  }

  return response.data;
}

// privateAPI 응답 인터셉터 - 401 에러 시 토큰 갱신
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

privateAPI.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러가 아니거나 이미 재시도한 요청이면 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 이미 토큰 갱신 중이면 대기열에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => privateAPI(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 토큰 갱신 시도
      await refreshAccessToken();

      // 대기 중인 요청들 처리
      processQueue();

      // 원래 요청 재시도
      return privateAPI(originalRequest);
    } catch (refreshError) {
      // 토큰 갱신 실패
      processQueue(refreshError as AxiosError);

      // 로그아웃 처리
      const store = useAuthStore.getState();
      store.forceLogout();

      // 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        window.location.href = "/?needLogin=true";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// 개발 환경에서 요청/응답 로깅은 필요시 추가 가능
// import { logger } from "../utils/logger";
//
// if (import.meta.env.DEV) {
//   const logRequest = (config: InternalAxiosRequestConfig) => {
//     logger.api(config.method?.toUpperCase() || 'REQUEST', config.url || '', undefined, config);
//     return config;
//   };
//
//   privateAPI.interceptors.request.use(logRequest);
// }

// 기본 내보내기
export default {
  API,
  authApi,
  privateAPI,
};
