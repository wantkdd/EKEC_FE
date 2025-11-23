/**
 * crewInfoMapper 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { toServerCrewInfo } from "../mappers/crewInfoMapper";
import type { CrewInfoRequest } from "../../types/crewCreate/crew";

describe("crewInfoMapper", () => {
  const baseParams = {
    crewName: "테스트 크루",
    crewDescription: "테스트 설명",
    headcount: 20,
    category: 1,
    activities: [1, 2, 3],
    styles: [4, 5],
    filters: {
      regionSido: "서울",
      regionGu: "강남구",
    },
    age: 25,
    selectedGender: 1,
    isHeadcountUnlimited: false,
    isGenderUnlimited: false,
    recruitMessage: "모집 메시지",
  };

  describe("toServerCrewInfo", () => {
    it("should map basic parameters correctly", () => {
      const result = toServerCrewInfo(baseParams);

      expect(result.name).toBe("테스트 크루");
      expect(result.description).toBe("테스트 설명");
      expect(result.maxCapacity).toBe(20);
      expect(result.category).toBe(1);
      expect(result.region).toBe(1); // 서울 강남구의 ID
    });

    it("should handle unlimited headcount", () => {
      const params = {
        ...baseParams,
        isHeadcountUnlimited: true,
        headcount: 50,
      };

      const result = toServerCrewInfo(params);
      expect(result.maxCapacity).toBe(0); // unlimited일 때 0으로 설정
    });

    it("should handle unlimited gender", () => {
      const params = {
        ...baseParams,
        isGenderUnlimited: true,
        selectedGender: 1,
      };

      const result = toServerCrewInfo(params);
      expect(result.gender).toBe(0); // unlimited일 때 0으로 설정
    });

    it("should trim recruit message", () => {
      const params = {
        ...baseParams,
        recruitMessage: "  메시지  ",
      };

      const result = toServerCrewInfo(params);
      expect(result.recruitMessage).toBe("메시지");
    });

    it("should handle null recruit message", () => {
      const params = {
        ...baseParams,
        recruitMessage: null as any,
      };

      const result = toServerCrewInfo(params);
      expect(result.recruitMessage).toBe("");
    });

    it("should handle null headcount", () => {
      const params = {
        ...baseParams,
        headcount: null,
        isHeadcountUnlimited: false,
      };

      const result = toServerCrewInfo(params);
      expect(result.maxCapacity).toBe(0);
    });

    it("should handle null category", () => {
      const params = {
        ...baseParams,
        category: null,
      };

      const result = toServerCrewInfo(params);
      expect(result.category).toBe(0);
    });

    it("should handle null age", () => {
      const params = {
        ...baseParams,
        age: null,
      };

      const result = toServerCrewInfo(params);
      expect(result.age).toBe(0);
    });

    it("should handle null gender when not unlimited", () => {
      const params = {
        ...baseParams,
        selectedGender: null,
        isGenderUnlimited: false,
      };

      const result = toServerCrewInfo(params);
      expect(result.gender).toBe(0);
    });

    it("should omit region when not selected", () => {
      const params = {
        ...baseParams,
        filters: {
          regionSido: null,
          regionGu: null,
        },
      };

      const result = toServerCrewInfo(params);
      expect((result as any).region).toBeUndefined();
    });

    it("should include all array fields", () => {
      const params = {
        ...baseParams,
        activities: [1, 2, 3, 4],
        styles: [5, 6, 7],
      };

      const result = toServerCrewInfo(params);
      expect(result.activities).toEqual([1, 2, 3, 4]);
      expect(result.styles).toEqual([5, 6, 7]);
    });

    it("should handle empty arrays", () => {
      const params = {
        ...baseParams,
        activities: [],
        styles: [],
      };

      const result = toServerCrewInfo(params);
      expect(result.activities).toEqual([]);
      expect(result.styles).toEqual([]);
    });

    it("should work with various region combinations", () => {
      const regionTests = [
        { sido: "서울", gu: "강남구", expectedId: 1 },
        { sido: "서울", gu: "마포구", expectedId: 13 },
        { sido: "경기", gu: "수원시", expectedId: 26 },
        { sido: "부산", gu: "해운대구", expectedId: 94 },
      ];

      regionTests.forEach(({ sido, gu, expectedId }) => {
        const params = {
          ...baseParams,
          filters: { regionSido: sido, regionGu: gu },
        };
        const result = toServerCrewInfo(params);
        expect(result.region).toBe(expectedId);
      });
    });

    it("should return correct type structure", () => {
      const result = toServerCrewInfo(baseParams);

      // Check that all required fields are present
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("recruitMessage");
      expect(result).toHaveProperty("maxCapacity");
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("age");
      expect(result).toHaveProperty("gender");
      expect(result).toHaveProperty("activities");
      expect(result).toHaveProperty("styles");
      expect(result).toHaveProperty("region");
    });
  });
});
