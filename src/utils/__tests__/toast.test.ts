/**
 * toast 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showConfirm,
  showLoading,
  dismissToast,
} from "../toast";
import toast from "react-hot-toast";

vi.mock("react-hot-toast");

describe("toast utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("showSuccess", () => {
    it("should show success message with correct options", () => {
      const message = "성공 메시지";
      showSuccess(message);

      expect(toast.success).toHaveBeenCalledWith(message, {
        duration: 3000,
        position: "top-center",
      });
    });

    it("should handle various messages", () => {
      const messages = [
        "저장되었습니다",
        "삭제되었습니다",
        "업데이트 완료",
        "",
      ];

      messages.forEach((msg) => {
        vi.clearAllMocks();
        showSuccess(msg);
        expect(toast.success).toHaveBeenCalledWith(msg, expect.any(Object));
      });
    });
  });

  describe("showError", () => {
    it("should show error message with correct options", () => {
      const message = "에러 메시지";
      showError(message);

      expect(toast.error).toHaveBeenCalledWith(message, {
        duration: 4000,
        position: "top-center",
      });
    });

    it("should have longer duration for errors", () => {
      showError("테스트");
      const callArgs = (toast.error as any).mock.calls[0];
      expect(callArgs[1].duration).toBe(4000);
    });
  });

  describe("showInfo", () => {
    it("should show info message with info icon", () => {
      const message = "정보 메시지";
      showInfo(message);

      expect(toast).toHaveBeenCalledWith(message, {
        duration: 3000,
        position: "top-center",
        icon: "ℹ️",
      });
    });
  });

  describe("showWarning", () => {
    it("should show warning message with warning icon", () => {
      const message = "경고 메시지";
      showWarning(message);

      expect(toast).toHaveBeenCalledWith(message, {
        duration: 3000,
        position: "top-center",
        icon: "⚠️",
      });
    });
  });

  describe("showConfirm", () => {
    it("should return promise that resolves to true when confirmed", async () => {
      window.confirm = vi.fn().mockReturnValue(true);
      const result = await showConfirm("확인하시겠습니까?");
      expect(result).toBe(true);
    });

    it("should return promise that resolves to false when cancelled", async () => {
      window.confirm = vi.fn().mockReturnValue(false);
      const result = await showConfirm("취소하시겠습니까?");
      expect(result).toBe(false);
    });

    it("should call window.confirm with the message", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      const message = "정말 삭제하시겠습니까?";
      await showConfirm(message);
      expect(confirmSpy).toHaveBeenCalledWith(message);
    });
  });

  describe("showLoading", () => {
    it("should show loading toast and return toast id", () => {
      const mockToastId = "toast-123";
      (toast.loading as any).mockReturnValue(mockToastId);

      const result = showLoading("로딩 중...");

      expect(toast.loading).toHaveBeenCalledWith("로딩 중...", {
        position: "top-center",
      });
      expect(result).toBe(mockToastId);
    });
  });

  describe("dismissToast", () => {
    it("should dismiss toast with given id", () => {
      const toastId = "toast-456";
      dismissToast(toastId);

      expect(toast.dismiss).toHaveBeenCalledWith(toastId);
    });
  });
});
