/**
 * apply/selection 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { resolveSingle, resolveCategoryId } from "../selection";

describe("apply/selection utilities", () => {
  describe("resolveSingle", () => {
    it("should return idCandidate if it is in allowed list", () => {
      const result = resolveSingle({
        idCandidate: 5,
        flag: undefined,
        rawId: undefined,
        allowed: [1, 2, 5, 10],
      });
      expect(result).toBe(5);
    });

    it("should return rawId if flag is 1 and rawId is provided", () => {
      const result = resolveSingle({
        idCandidate: undefined,
        flag: 1,
        rawId: 3,
        allowed: [3, 4],
      });
      expect(result).toBe(3);
    });

    it("should prioritize idCandidate over flag", () => {
      const result = resolveSingle({
        idCandidate: 5,
        flag: 1,
        rawId: 10,
        allowed: [5, 10],
      });
      expect(result).toBe(5);
    });

    it("should return 0 if idCandidate is not in allowed list", () => {
      const result = resolveSingle({
        idCandidate: 20,
        flag: undefined,
        rawId: undefined,
        allowed: [1, 2, 5],
      });
      expect(result).toBe(0);
    });

    it("should return 0 if flag is not 1", () => {
      const result = resolveSingle({
        idCandidate: undefined,
        flag: 0,
        rawId: 5,
        allowed: [5],
      });
      expect(result).toBe(0);
    });

    it("should return 0 if no valid condition is met", () => {
      const result = resolveSingle({
        idCandidate: undefined,
        flag: undefined,
        rawId: undefined,
        allowed: [1, 2, 3],
      });
      expect(result).toBe(0);
    });

    it("should handle empty allowed list", () => {
      const result = resolveSingle({
        idCandidate: 5,
        flag: undefined,
        rawId: undefined,
        allowed: [],
      });
      expect(result).toBe(0);
    });

    it("should work with multiple allowed values", () => {
      const allowed = [1, 5, 10, 20, 50, 100];
      allowed.forEach((val) => {
        const result = resolveSingle({
          idCandidate: val,
          flag: undefined,
          rawId: undefined,
          allowed,
        });
        expect(result).toBe(val);
      });
    });
  });

  describe("resolveCategoryId", () => {
    it("should use primary resolution first", () => {
      const result = resolveCategoryId({
        detail: { categoryId: 5 },
        rawCategory: 2,
        allowedCategories: [5],
      });
      expect(result).toBe(5);
    });

    it("should use flag for primary resolution", () => {
      const result = resolveCategoryId({
        detail: { category: 1 },
        rawCategory: 3,
        allowedCategories: [3],
      });
      expect(result).toBe(3);
    });

    it("should fallback to alternative field names if primary fails", () => {
      const result = resolveCategoryId({
        detail: { category: 7 }, // using 'category' instead of 'categoryId'
        rawCategory: 2,
        allowedCategories: [7],
      });
      expect(result).toBe(7);
    });

    it("should return 0 if both primary and fallback fail", () => {
      const result = resolveCategoryId({
        detail: { categoryId: 100, category: 200 },
        rawCategory: undefined,
        allowedCategories: [5, 10],
      });
      expect(result).toBe(0);
    });

    it("should handle empty allowed categories", () => {
      const result = resolveCategoryId({
        detail: { categoryId: 5 },
        rawCategory: undefined,
        allowedCategories: [],
      });
      expect(result).toBe(0);
    });

    it("should handle null detail with empty allowed categories", () => {
      const result = resolveCategoryId({
        detail: {} as Record<string, unknown>,
        rawCategory: 3,
        allowedCategories: [],
      });
      expect(result).toBe(0);
    });

    it("should use rawCategory when flag is set in detail", () => {
      const result = resolveCategoryId({
        detail: { category: 1 },
        rawCategory: 3,
        allowedCategories: [3],
      });
      expect(result).toBe(3);
    });
  });
});
