import { logger } from "../../utils/logger";
// hooks/useCrewInfo.ts

import { useState, useEffect } from "react";
import { getCrewInfo } from "../../apis/crewApply";
import type { CrewInfoResponse } from "../../apis/crewApply";
interface UseCrewInfoReturn {
  crewInfo: CrewInfoResponse["data"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 특정 크루 정보를 조회하는 커스텀 훅
 * @param crewId - 조회할 크루 ID
 * @param immediate - 즉시 호출 여부 (기본값: true)
 * @returns 크루 정보, 로딩 상태, 에러, 재조회 함수
 */
export const useCrewInfo = (
  crewId: number,
  immediate: boolean = true
): UseCrewInfoReturn => {
  const [crewInfo, setCrewInfo] = useState<CrewInfoResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCrewInfo = async () => {
    if (!crewId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getCrewInfo(crewId);

      if (response.resultType === "SUCCESS") {
        setCrewInfo(response.data);
      } else {
        setError(response.error || "크루 정보 조회에 실패했습니다.");
        setCrewInfo(null);
      }
    } catch (err) {
      logger.error("크루 정보 조회 에러:", err);
      setError("크루 정보를 불러오는 중 오류가 발생했습니다.");
      setCrewInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate && crewId) {
      fetchCrewInfo();
    }
  }, [crewId, immediate]);

  return {
    crewInfo,
    loading,
    error,
    refetch: fetchCrewInfo,
  };
};
