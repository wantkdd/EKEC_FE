/**
 * errorHandler 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import {
  isAxiosError,
  getErrorMessage,
  getErrorCode,
  getStatusCode,
} from "../errorHandler";

describe("errorHandler", () => {
  describe("isAxiosError", () => {
    it("should return true for AxiosError", () => {
      const error = {
        isAxiosError: true,
        message: "Test error",
        name: "AxiosError",
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      expect(isAxiosError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test error");
      expect(isAxiosError(error)).toBe(false);
    });

    it("should return false for string", () => {
      expect(isAxiosError("error message")).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from AxiosError with error.reason", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            error: {
              reason: "Custom error reason",
            },
          },
        },
      } as unknown as AxiosError;

      expect(getErrorMessage(error)).toBe("Custom error reason");
    });

    it("should return default message for 404", () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {},
        },
        message: "",
      } as unknown as AxiosError;

      expect(getErrorMessage(error)).toBe(
        "요청한 리소스를 찾을 수 없습니다."
      );
    });

    it("should return default message for 401", () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {},
        },
        message: "",
      } as unknown as AxiosError;

      expect(getErrorMessage(error)).toBe("로그인이 필요합니다.");
    });

    it("should handle regular Error object", () => {
      const error = new Error("Test error message");
      expect(getErrorMessage(error)).toBe("Test error message");
    });

    it("should handle string error", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("should return default message for unknown error", () => {
      expect(getErrorMessage(null)).toBe("알 수 없는 오류가 발생했습니다.");
      expect(getErrorMessage(undefined)).toBe(
        "알 수 없는 오류가 발생했습니다."
      );
      expect(getErrorMessage({})).toBe("알 수 없는 오류가 발생했습니다.");
    });
  });

  describe("getErrorCode", () => {
    it("should extract error code from AxiosError", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            error: {
              errorCode: "ERR_001",
            },
          },
        },
      } as unknown as AxiosError;

      expect(getErrorCode(error)).toBe("ERR_001");
    });

    it("should return undefined for non-Axios error", () => {
      expect(getErrorCode(new Error("test"))).toBeUndefined();
    });
  });

  describe("getStatusCode", () => {
    it("should extract status code from AxiosError", () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
        },
      } as unknown as AxiosError;

      expect(getStatusCode(error)).toBe(404);
    });

    it("should return undefined for non-Axios error", () => {
      expect(getStatusCode(new Error("test"))).toBeUndefined();
    });
  });
});
