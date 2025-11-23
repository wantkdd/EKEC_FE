import { privateAPI } from "../../apis/httpClient";

/** ===== 타입 ===== */
export type CrewInfo = {
  crewId: number;
  title: string;
  content: string;
  score: number;
  memberCount: number;
  crewCapacity: number;
  bannerImage: string | null;
  nickname: string;
  profileImage: string | null;
  category: string;
  introduction: string;
};

export type MyRole = "LEADER" | "MEMBER" | "GUEST" | "MANAGER";

/** ===== 공통 ===== */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// '/api'가 정확히 한 번만 들어가도록 URL 생성
const apiUrl = (path: string) => {
  const p = path.replace(/^\/+/, "");
  const baseHasApi = /\/api$/.test(API_BASE);
  const pathStartsWithApi = /^api(\/|$)/.test(p);
  const normalizedPath = baseHasApi
    ? p.replace(/^api\/?/, "")
    : pathStartsWithApi ? p
    : `api/${p}`;

  return `${API_BASE}/${normalizedPath}`.replace(/\/+$/, "/");
};

/** ===== 크루 정보 조회 ===== */
export const fetchCrewInfo = async (
  crewId: string | number
): Promise<CrewInfo> => {
  const url = apiUrl(`/crew/${crewId}/info/`);
  const response = await privateAPI.get(url);
  const json = response.data;

  if (!json || json.resultType !== "SUCCESS" || json.data == null) {
    const reason = json?.error?.reason || `HTTP ${response.status}`;
    throw new Error(`fetchCrewInfo failed: ${reason}`);
  }
  return json.data as CrewInfo;
};

/** ===== 역할 코드 → 라벨 ===== */
const roleCodeToLabel = (code: unknown): MyRole => {
  switch (Number(code)) {
    case 0: return "MEMBER";
    case 1: return "MANAGER";
    case 2: return "LEADER";
    default: return "GUEST";
  }
};

/** ===== 내 역할 조회 (로그인 필요) ===== */
export const fetchMyRole = async (crewId: string | number): Promise<MyRole> => {
  try {
    const url = apiUrl(`/crew/${crewId}/myrole/`);
    const response = await privateAPI.get(url);
    const json = response.data;

    if (json.resultType !== "SUCCESS" || json.data == null) {
      return "GUEST";
    }
    return roleCodeToLabel(json.data.role);
  } catch {
    // 401 또는 다른 에러 시 게스트 처리
    return "GUEST";
  }
};

/** ===== 크루 소개 수정 (크루장 전용) ===== */
export const updateCrewIntroduction = async (
  crewId: string | number,
  introduction: string
): Promise<{ crewId: number; introduction: string }> => {
  const url = apiUrl(`/crew/${crewId}/info/introduce`);
  const response = await privateAPI.put(url, { introduction });
  const json = response.data;

  if (json.resultType !== "SUCCESS" || json.data == null) {
    const reason = json?.error?.reason || `HTTP ${response.status}`;
    throw new Error(`updateCrewIntroduction failed: ${reason}`);
  }
  return json.data as { crewId: number; introduction: string };
};
