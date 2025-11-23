/**
 * logger 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../logger";

describe("logger", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all logging methods", () => {
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.api).toBeDefined();
  });

  it("should log error with error object", () => {
    const error = new Error("Test error");
    logger.error("Test message", error);

    // 개발 환경에서는 console.error가 호출됨
    if (import.meta.env.DEV) {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }
  });

  it("should have utility methods", () => {
    expect(logger.timeStart).toBeDefined();
    expect(logger.timeEnd).toBeDefined();
    expect(logger.groupStart).toBeDefined();
    expect(logger.groupEnd).toBeDefined();
    expect(logger.table).toBeDefined();
  });
});
