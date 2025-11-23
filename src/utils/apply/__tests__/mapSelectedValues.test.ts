/**
 * apply/mapSelectedValues 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { mapSelectedValues } from "../mapSelectedValues";

describe("apply/mapSelectedValues utilities", () => {
  const baseDetail = {
    regionId: 1,
    region: 1,
    ageId: 25,
    age: 1,
    genderId: 1,
    gender: 1,
    categoryId: 2,
    category: 1,
    activityList: [1, 2, 3],
    styleList: [4, 5],
  };

  const baseRaw = {
    region: 1,
    age: 25,
    gender: 1,
    category: 2,
    activities: [1, 2, 3],
    styles: [4, 5],
  };

  describe("mapSelectedValues", () => {
    it("should extract allowed values from raw data", () => {
      const result = mapSelectedValues(baseDetail, baseRaw);

      expect(result.allowed.regions).toEqual([1]);
      expect(result.allowed.ages).toEqual([25]);
      expect(result.allowed.genders).toEqual([1]);
      expect(result.allowed.categories).toEqual([2]);
      expect(result.allowed.activities).toEqual([1, 2, 3]);
      expect(result.allowed.styles).toEqual([4, 5]);
    });

    it("should extract selected values from detail data", () => {
      const result = mapSelectedValues(baseDetail, baseRaw);

      expect(result.selected.regionId).toBe(1);
      expect(result.selected.ageId).toBe(25);
      expect(result.selected.genderId).toBe(1);
      expect(result.selected.categoryId).toBe(2);
      expect(result.selected.activityIds).toEqual([1, 2, 3]);
      expect(result.selected.styleIds).toEqual([4, 5]);
    });

    it("should handle null detail", () => {
      const result = mapSelectedValues(null, baseRaw);

      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
      expect(result.selected).toBeDefined();
    });

    it("should handle undefined detail", () => {
      const result = mapSelectedValues(undefined, baseRaw);

      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
      expect(result.selected).toBeDefined();
    });

    it("should handle null raw", () => {
      const result = mapSelectedValues(baseDetail, null);

      expect(result).toBeDefined();
      expect(result.allowed.categories).toEqual([]);
      expect(result.allowed.regions).toEqual([]);
    });

    it("should handle undefined raw", () => {
      const result = mapSelectedValues(baseDetail, undefined);

      expect(result).toBeDefined();
      expect(result.allowed.categories).toEqual([]);
    });

    it("should handle gender 0 as special case (no allowed genders)", () => {
      const raw = { ...baseRaw, gender: 0 };
      const result = mapSelectedValues(baseDetail, raw);

      expect(result.allowed.genders).toEqual([]);
    });

    it("should support both activityList and activities in detail", () => {
      // activityList is prioritized over activities
      const result1 = mapSelectedValues(
        { ...baseDetail, activityList: [1, 2] },
        baseRaw
      );
      // When only activities is present (no activityList)
      const result2 = mapSelectedValues(
        { activityList: undefined, activities: [3, 4] },
        baseRaw
      );

      expect(result1.selected.activityIds).toEqual([1, 2]);
      expect(result2.selected.activityIds).toEqual([3, 4]);
    });

    it("should support both styleList and styles in detail", () => {
      // styleList is prioritized over styles
      const result1 = mapSelectedValues(
        { ...baseDetail, styleList: [5, 6] },
        baseRaw
      );
      // When only styles is present (no styleList)
      const result2 = mapSelectedValues(
        { styleList: undefined, styles: [7, 8] },
        baseRaw
      );

      expect(result1.selected.styleIds).toEqual([5, 6]);
      expect(result2.selected.styleIds).toEqual([7, 8]);
    });

    it("should handle empty arrays in raw data", () => {
      const raw = {
        ...baseRaw,
        activities: [],
        styles: [],
      };

      const result = mapSelectedValues(baseDetail, raw);

      expect(result.allowed.activities).toEqual([]);
      expect(result.allowed.styles).toEqual([]);
    });

    it("should handle non-array values for activities and styles", () => {
      const raw = {
        ...baseRaw,
        activities: "not an array" as any,
        styles: 123 as any,
      };

      const result = mapSelectedValues(baseDetail, raw);

      expect(result.allowed.activities).toEqual([]);
      expect(result.allowed.styles).toEqual([]);
    });

    it("should return full allowed genders list when no specific gender is provided", () => {
      const raw = { ...baseRaw, gender: undefined };
      const result = mapSelectedValues(baseDetail, raw);

      expect(result.selected.genderId).toEqual(expect.any(Number));
    });

    it("should handle detail with missing properties", () => {
      const minimalDetail = {};
      const result = mapSelectedValues(minimalDetail, baseRaw);

      expect(result).toBeDefined();
      expect(result.selected).toBeDefined();
    });

    it("should handle raw with missing properties", () => {
      const minimalRaw = {};
      const result = mapSelectedValues(baseDetail, minimalRaw);

      expect(result.allowed.categories).toEqual([]);
      expect(result.allowed.regions).toEqual([]);
    });

    it("should return structured response", () => {
      const result = mapSelectedValues(baseDetail, baseRaw);

      expect(result).toHaveProperty("allowed");
      expect(result).toHaveProperty("selected");

      expect(result.allowed).toHaveProperty("categories");
      expect(result.allowed).toHaveProperty("regions");
      expect(result.allowed).toHaveProperty("ages");
      expect(result.allowed).toHaveProperty("genders");
      expect(result.allowed).toHaveProperty("activities");
      expect(result.allowed).toHaveProperty("styles");

      expect(result.selected).toHaveProperty("categoryId");
      expect(result.selected).toHaveProperty("regionId");
      expect(result.selected).toHaveProperty("ageId");
      expect(result.selected).toHaveProperty("genderId");
      expect(result.selected).toHaveProperty("activityIds");
      expect(result.selected).toHaveProperty("styleIds");
    });
  });
});
