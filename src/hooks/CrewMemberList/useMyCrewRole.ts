// hooks/useMyCrewRole.ts
import { useQuery } from "@tanstack/react-query";
import { privateAPI } from '../../apis/httpClient';
import type { CrewRole } from "../../types/detail/crewMember";
import { AxiosError } from "axios";

export function useMyCrewRole(crewId: number) {
  return useQuery({
    queryKey: ["myCrewRole", crewId],
    queryFn: async () => {
      const res = await privateAPI.get(`/crew/${crewId}/myrole/`);
      return res.data?.data?.role as CrewRole;
    },
    enabled: !!crewId,
    retry: (failureCount, error) => {
      // 타입 가드를 사용해서 안전하게 status 확인
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        // 4xx 에러는 재시도하지 않음
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      // 네트워크 에러나 서버 에러는 최대 3번 재시도
      return failureCount < 3;
    },
  });
}
