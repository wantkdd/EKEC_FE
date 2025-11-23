/**
 * regions 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { getRegionId, regionIdLookup, idToRegion } from "../regions";

describe("regions utilities", () => {
  describe("getRegionId", () => {
    it("should return region id for valid sido and gu", () => {
      const regionId = getRegionId("서울", "강남구");
      expect(regionId).toBe(1);
    });

    it("should return correct id for different regions", () => {
      expect(getRegionId("서울", "마포구")).toBe(13);
      expect(getRegionId("경기", "수원시")).toBe(26);
      expect(getRegionId("부산", "해운대구")).toBe(94);
    });

    it("should return null for missing sido", () => {
      const result = getRegionId(null, "강남구");
      expect(result).toBeNull();
    });

    it("should return null for missing gu", () => {
      const result = getRegionId("서울", null);
      expect(result).toBeNull();
    });

    it("should return null for missing both sido and gu", () => {
      const result = getRegionId(undefined, undefined);
      expect(result).toBeNull();
    });

    it("should return null for invalid sido", () => {
      const result = getRegionId("존재하지않는도", "강남구");
      expect(result).toBeNull();
    });

    it("should return null for invalid gu", () => {
      const result = getRegionId("서울", "존재하지않는구");
      expect(result).toBeNull();
    });

    it("should handle empty strings", () => {
      const result = getRegionId("", "강남구");
      expect(result).toBeNull();
    });
  });

  describe("regionIdLookup", () => {
    it("should have lookup structure organized by sido and gu", () => {
      expect(regionIdLookup["서울"]).toBeDefined();
      expect(regionIdLookup["서울"]["강남구"]).toBe(1);
    });

    it("should contain all major regions", () => {
      const sidoList = ["서울", "경기", "인천", "강원", "대전", "부산"];
      sidoList.forEach((sido) => {
        expect(regionIdLookup[sido]).toBeDefined();
      });
    });
  });

  describe("idToRegion", () => {
    it("should map id to region object with sido and gu", () => {
      const region = idToRegion[1];
      expect(region).toEqual({ sido: "서울", gu: "강남구" });
    });

    it("should handle multiple ids", () => {
      expect(idToRegion[1]).toEqual({ sido: "서울", gu: "강남구" });
      expect(idToRegion[13]).toEqual({ sido: "서울", gu: "마포구" });
      expect(idToRegion[26]).toEqual({ sido: "경기", gu: "수원시" });
    });

    it("should have correct region for various ids", () => {
      const testCases = [
        [1, { sido: "서울", gu: "강남구" }],
        [94, { sido: "부산", gu: "해운대구" }],
        [148, { sido: "서울", gu: "전지역" }],
      ];

      testCases.forEach(([id, expected]) => {
        expect(idToRegion[id as number]).toEqual(expected);
      });
    });
  });

  describe("bidirectional mapping", () => {
    it("should maintain consistency between getRegionId and idToRegion", () => {
      // getRegionId를 사용해서 ID를 얻고
      const id = getRegionId("서울", "강남구");

      // idToRegion으로 다시 변환하면 원래값이 나와야 함
      if (id !== null) {
        const region = idToRegion[id];
        expect(region.sido).toBe("서울");
        expect(region.gu).toBe("강남구");
      }
    });
  });
});
