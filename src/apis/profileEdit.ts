// src/api/profileApi.ts

import { privateAPI } from "./httpClient";
import { AxiosError } from "axios";
import { logger } from "../utils/logger";

// 타입 정의
export interface ProfileUpdateData {
  name: string;
  nickname: string;
  phone: string;
  birthDate?: string;
  password?: string;
  passwordConfirm?: string;
  carrier?: string;
}

export interface User {
  id?: number;
  name?: string;
  nickname?: string;
  gender?: number;
  phone?: string;
  email?: string;
  birthday?: string;
  defaultImage?: boolean;
}

export interface ApiResponse<T = any> {
  resultType: "SUCCESS" | "ERROR";
  error: string | null;
  data: T;
}

// 생년월일 파싱 헬퍼 함수
const parseBirthDate = (birthDate?: string) => {
  if (!birthDate) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: 1,
      day: 1,
    };
  }

  const parts = birthDate.split("-");
  return {
    year: parts[0] ? parseInt(parts[0]) : new Date().getFullYear(),
    month: parts[1] ? parseInt(parts[1]) : 1,
    day: parts[2] ? parseInt(parts[2]) : 1,
  };
};

// src/api/profileApi.ts

export const updateProfile = async (
  profileData: {
    name: string;
    nickname: string;
    phone: string;
    birthDate: string;
  },
  isNotDefine: boolean,
  user: User | null
): Promise<ApiResponse> => {
  try {
    const birthday = parseBirthDate(profileData.birthDate);

    const response = await privateAPI.post("/api/auth/profile", {
      defaultImage: true,
      name: profileData.name, // 기존 값 유지
      nickname: profileData.nickname, // 수정 가능 ✅
      gender: isNotDefine ? 0 : user?.gender || 0, // 밝히지 않음으로만 수정 가능 ✅
      phone: profileData.phone, // 기존 값 유지
      birthday,
    });

    return response.data;
  } catch (error) {
    logger.error("프로필 수정 실패", error);

    if (error instanceof Error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }

    throw error;
  }
};

export const getProfile = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await privateAPI.get("/api/auth/profile");
    return response.data;
  } catch (error) {
    logger.error("프로필 조회 실패", error);
    throw error;
  }
};
