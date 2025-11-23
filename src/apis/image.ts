import { logger } from "../utils/logger";

export interface ImageLoadParams {
  type: string; // 0: 배너, 1: 프로필, 2: 게시글, 3: 앨범
  fileName: string;
}

export interface ImageErrorResponse {
  resultType: "FAIL";
  error: {
    errorCode: string;
    reason: string;
    data: {
      type: string;
      fileName: string;
    };
  };
  data: null;
}

/**
 * 이미지 로드 API
 * @param params 이미지 타입과 파일명
 * @returns 이미지 URL 또는 에러 응답
 */
export const loadImage = async (params: ImageLoadParams): Promise<string> => {
  try {
    const { type, fileName } = params;

    // 이미지 타입 유효성 검사
    if (!["0", "1", "2", "3"].includes(type)) {
      throw new Error("올바른 이미지 종류(타입)을 입력해 주세요.");
    }

    // 이미지 URL 생성
    const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/image/?type=${type}&fileName=${encodeURIComponent(fileName)}`;

    // 이미지 존재 여부 확인 (HEAD 요청)
    const response = await fetch(imageUrl, { method: "HEAD" });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("존재하지 않는 이미지입니다.");
      } else if (response.status === 502) {
        throw new Error("사용할 수 없는 이미지 URL 입니다.");
      } else {
        throw new Error(`이미지 로드 실패: ${response.status}`);
      }
    }

    return imageUrl;
  } catch (error) {
    logger.error("이미지 로드 실패", error);
    throw error;
  }
};

/**
 * 이미지 URL 생성 헬퍼 함수
 * @param type 이미지 타입
 * @param fileName 파일명
 * @returns 완성된 이미지 URL
 */
export const createImageUrl = (type: string, fileName: string): string => {
  if (!fileName) return "";

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.ekec.site";
  return `${baseUrl}/image/?type=${type}&fileName=${encodeURIComponent(fileName)}`;
};

/**
 * 이미지 타입별 URL 생성 헬퍼 함수들
 */
export const imageUrlHelpers = {
  banner: (fileName: string) => createImageUrl("0", fileName),
  profile: (fileName: string) => createImageUrl("1", fileName),
  post: (fileName: string) => createImageUrl("2", fileName),
  album: (fileName: string) => createImageUrl("3", fileName),
};

/**
 * 이미지 타입 상수
 */
export const IMAGE_TYPES = {
  BANNER: "0",
  PROFILE: "1",
  POST: "2",
  ALBUM: "3",
} as const;

export type ImageType = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES];
