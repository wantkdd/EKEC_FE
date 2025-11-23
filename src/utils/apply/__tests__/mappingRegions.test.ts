/**
 * apply/mappingRegions 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { mapServerRegionsToOptions } from "../mappingRegions";

describe("apply/mappingRegions utilities", () => {
  describe("mapServerRegionsToOptions", () => {
    it("should map server regions to ApplyOption format", () => {
      const options = mapServerRegionsToOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it("should have correct structure with value and label", () => {
      const options = mapServerRegionsToOptions();

      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("number");
        expect(typeof option.label).toBe("string");
      });
    });

    it("should format label as '도·지역' format", () => {
      const options = mapServerRegionsToOptions();

      // Check some known regions
      const seoulOption = options.find((opt) => opt.value === 1);
      expect(seoulOption?.label).toMatch(/·/); // Contains the middle dot
      expect(seoulOption?.label).toContain("서울");
    });

    it("should have at least regional and district level options", () => {
      const options = mapServerRegionsToOptions();
      const labels = options.map((opt) => opt.label);

      // Should contain both full province and district level
      expect(labels.some((l) => l.includes("서울") && l.includes("전지역"))).toBe(
        true
      );
      expect(labels.some((l) => l.includes("서울") && l.includes("강남구"))).toBe(
        true
      );
    });

    it("should have unique values", () => {
      const options = mapServerRegionsToOptions();
      const values = options.map((opt) => opt.value);
      const uniqueValues = new Set(values);

      expect(values.length).toBe(uniqueValues.size);
    });

    it("should include major cities", () => {
      const options = mapServerRegionsToOptions();
      const majorCities = ["서울", "경기", "부산", "대구", "인천"];

      majorCities.forEach((city) => {
        const hasCity = options.some((opt) => opt.label.includes(city));
        expect(hasCity).toBe(true);
      });
    });

    it("should map correct value for seoul gangnam", () => {
      const options = mapServerRegionsToOptions();
      const seoulGangnam = options.find((opt) =>
        opt.label.includes("서울") && opt.label.includes("강남구")
      );

      expect(seoulGangnam).toBeDefined();
      expect(seoulGangnam?.value).toBe(1);
    });

    it("should maintain consistent order", () => {
      const options1 = mapServerRegionsToOptions();
      const options2 = mapServerRegionsToOptions();

      expect(options1).toEqual(options2);
    });
  });
});
