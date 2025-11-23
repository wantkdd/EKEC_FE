/**
 * 에러 핸들링 유틸리티
 *
 * 앱 전체에서 발생하는 에러를 일관된 방식으로 처리합니다.
 */

import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { logger } from "./logger";

/**
 * API 에러 응답 타입
 */
interface ApiErrorResponse {
  resultType?: "ERROR" | "FAIL";
  error?: {
    errorCode?: string;
    reason?: string;
    message?: string;
    data?: unknown;
  };
  message?: string;
}

/**
 * 에러 타입 판별
 */
export const isAxiosError = (error: unknown): error is AxiosError<ApiErrorResponse> => {
  return error != null && (error as AxiosError).isAxiosError === true;
};

/**
 * 에러 메시지 추출
 */
export const getErrorMessage = (error: unknown): string => {
  // Axios 에러
  if (isAxiosError(error)) {
    const data = error.response?.data;

    // API 에러 응답 형식
    if (data?.error?.reason) {
      return data.error.reason;
    }
    if (data?.error?.message) {
      return data.error.message;
    }
    if (data?.message) {
      return data.message;
    }

    // HTTP 상태 코드별 기본 메시지
    const status = error.response?.status;
    switch (status) {
      case 400:
        return "잘못된 요청입니다.";
      case 401:
        return "로그인이 필요합니다.";
      case 403:
        return "권한이 없습니다.";
      case 404:
        return "요청한 리소스를 찾을 수 없습니다.";
      case 500:
        return "서버 오류가 발생했습니다.";
      case 503:
        return "서비스를 일시적으로 사용할 수 없습니다.";
      default:
        return error.message || "알 수 없는 오류가 발생했습니다.";
    }
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    return error.message;
  }

  // 문자열 에러
  if (typeof error === "string") {
    return error;
  }

  // 기타
  return "알 수 없는 오류가 발생했습니다.";
};

/**
 * 에러 코드 추출
 */
export const getErrorCode = (error: unknown): string | undefined => {
  if (isAxiosError(error)) {
    return error.response?.data?.error?.errorCode;
  }
  return undefined;
};

/**
 * HTTP 상태 코드 추출
 */
export const getStatusCode = (error: unknown): number | undefined => {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
};

/**
 * 에러를 로그에 기록하고 사용자에게 표시
 */
export const handleError = (
  error: unknown,
  options: {
    /** 커스텀 에러 메시지 */
    customMessage?: string;
    /** Toast 표시 여부 (기본: true) */
    showToast?: boolean;
    /** 로그 기록 여부 (기본: true) */
    logError?: boolean;
    /** 에러 발생 컨텍스트 (로그용) */
    context?: string;
  } = {}
) => {
  const {
    customMessage,
    showToast = true,
    logError: shouldLog = true,
    context = "Error",
  } = options;

  // 에러 정보 추출
  const message = customMessage || getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const statusCode = getStatusCode(error);

  // 로그 기록
  if (shouldLog) {
    logger.error(context, error, {
      message,
      errorCode,
      statusCode,
    });
  }

  // Toast 표시
  if (showToast) {
    toast.error(message, {
      duration: 4000,
      position: "top-center",
    });
  }

  return { message, errorCode, statusCode };
};

/**
 * 성공 메시지 표시
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: "top-center",
  });
};

/**
 * 정보 메시지 표시
 */
export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: "top-center",
    icon: "ℹ️",
  });
};

/**
 * 경고 메시지 표시
 */
export const showWarning = (message: string) => {
  toast(message, {
    duration: 4000,
    position: "top-center",
    icon: "⚠️",
  });
};

/**
 * 로딩 Toast 표시
 */
export const showLoading = (message: string = "처리 중...") => {
  return toast.loading(message, {
    position: "top-center",
  });
};

/**
 * 로딩 Toast 종료
 */
export const hideLoading = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Promise를 Toast와 함께 처리
 */
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: (data) =>
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success,
      error: (error) => {
        const errorMsg =
          typeof messages.error === "function"
            ? messages.error(error)
            : messages.error;

        // 추가로 에러 로깅
        logger.error("Promise failed", error);

        return errorMsg || getErrorMessage(error);
      },
    },
    {
      position: "top-center",
    }
  );
};
