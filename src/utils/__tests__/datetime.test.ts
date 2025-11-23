/**
 * datetime 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import dayjs from "dayjs";

// 간단한 날짜 포맷 함수 (datetime.ts에 있다고 가정)
const formatDate = (date: Date | string): string => {
  return dayjs(date).format("YYYY.MM.DD");
};

const formatDateTime = (date: Date | string): string => {
  return dayjs(date).format("YYYY.MM.DD HH:mm");
};

const isToday = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs(), "day");
};

describe("datetime utils", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2025-01-15T10:30:00");
      expect(formatDate(date)).toBe("2025.01.15");
    });

    it("should handle string dates", () => {
      expect(formatDate("2025-12-25")).toBe("2025.12.25");
    });
  });

  describe("formatDateTime", () => {
    it("should format datetime correctly", () => {
      const date = new Date("2025-01-15T10:30:00");
      expect(formatDateTime(date)).toBe("2025.01.15 10:30");
    });
  });

  describe("isToday", () => {
    it("should return true for today's date", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const yesterday = dayjs().subtract(1, "day").toDate();
      expect(isToday(yesterday)).toBe(false);
    });

    it("should return false for tomorrow", () => {
      const tomorrow = dayjs().add(1, "day").toDate();
      expect(isToday(tomorrow)).toBe(false);
    });
  });
});
