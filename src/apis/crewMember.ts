import type { CrewMember, CrewRole } from "../types/detail/crewMember";
import { privateAPI } from "./httpClient";
import { logger } from "../utils/logger";

interface CrewMemberResponse {
  members: CrewMember[];
  userRole: CrewRole;
}
// 크루원 리스트 가져오는 api
export const getCrewMembers = async (
  crewId: number
): Promise<CrewMemberResponse> => {
  const res = await privateAPI.get(`/crew/${crewId}/member`, {
    params: { page: 1, size: 24 },
  });
  return res.data.data;
};

// 역활 변경 (운영진/크루원) api
export const updateMemberRole = async (
  crewId: number,
  memberId: number,
  newRole: number
) => {
  logger.debug("요청 보내는 URL 확인", {
    url: `/crew/${crewId}/member/${memberId}/role`,
  });
  logger.debug("보낼 데이터", { role: newRole });

  const res = await privateAPI.put(`/crew/${crewId}/member/${memberId}/role`, {
    role: newRole,
  });
  return res.data.data;
};

// 멤버 강퇴 (방출) api
export const kickCrewMember = async (crewId: number, memberId: number) => {
  const res = await privateAPI.delete(
    `/crew/${crewId}/member/${memberId}/kick`
  );
  return res.data.data;
};
