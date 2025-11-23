/**
 * Vitest 테스트 환경 설정
 */

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
});

// 환경 변수 설정
import.meta.env.VITE_API_BASE_URL = "http://localhost:3000";
