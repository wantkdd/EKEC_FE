import { authApi } from "./httpClient";
import { authMeta } from "../utils/authMeta";
import type {
  RequestCreateProfile,
  RequestSign,
  ResponseCreateProfile,
  ResponseRefresh,
  ResponseSign,
  ResponseSignOut,
} from "../types/auth/types";



// 회원가입
export const signUpApi = async (data: RequestSign): Promise<ResponseSign> => {
  const response = await authApi.post<ResponseSign>("/auth/signup", data);
  return response.data;
};

// 로그인
export const signInApi = async (data: RequestSign): Promise<ResponseSign> => {
  const response = await authApi.post<ResponseSign>("/auth/login", data);

  if (response.data?.resultType === "SUCCESS") {
    authMeta.setAuthEver(); // 로그인 기록 저장
  }

  return response.data;
};

// 로그아웃
export const signOutApi = async (): Promise<ResponseSignOut> => {
  const response = await authApi.post<ResponseSignOut>("/auth/logout");
  // 명시적 로그아웃 시에만 기록 제거
  authMeta.clearAuthEver();
  return response.data;
};

// 토큰 갱신
export const refreshApi = async (): Promise<ResponseRefresh> => {
  const response = await authApi.post<ResponseRefresh>("/auth/refresh");

  if (response.status >= 200 && response.status < 300) {
    // 성공시 시각 기록
    authMeta.setLastRefreshSuccessAt(Date.now());
    // 세션 활성화 플래그
    try {
      sessionStorage.setItem("auth:live", "1");
    } catch {}
  }

  return response.data;
};

// 프로필 생성
export const createProfileApi = async (
  data: RequestCreateProfile
): Promise<ResponseCreateProfile> => {
  const form = new FormData();
  if (data.profileImage) form.append("profileImage", data.profileImage);
  form.append("defaultImage", String(data.defaultImage));
  form.append("name", data.name);
  form.append("nickname", data.nickname);
  form.append("gender", String(data.gender));
  form.append("phone", data.phone);
  form.append("birthday", JSON.stringify(data.birthday));

  const response = await authApi.post<ResponseCreateProfile>(
    "/auth/profile",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};
