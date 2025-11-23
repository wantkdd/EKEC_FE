import { logger } from "../../utils/logger";
import { useState, useEffect } from "react";
import { useLikeSchedule, useUnlikeSchedule } from "./useScheduleLike";

export const useScheduleLikeState = (
  crewId: string,
  scheduleId: string,
  serverLikeStatus?: boolean
) => {
  const [localLikeState, setLocalLikeState] = useState<{
    [planId: string]: boolean;
  }>({});

  const likeScheduleMutation = useLikeSchedule(crewId);
  const unlikeScheduleMutation = useUnlikeSchedule(crewId);

  // 에러 발생 시 로컬 상태 초기화
  useEffect(() => {
    if (likeScheduleMutation.isError && scheduleId) {
      setLocalLikeState((prev) => ({ ...prev, [scheduleId]: false }));
    }
    if (unlikeScheduleMutation.isError && scheduleId) {
      setLocalLikeState((prev) => ({ ...prev, [scheduleId]: true }));
    }
  }, [
    likeScheduleMutation.isError,
    unlikeScheduleMutation.isError,
    scheduleId,
  ]);

  const handleLikeToggle = () => {
    if (!crewId || !scheduleId) {
      logger.error("크루 ID 또는 일정 ID가 없습니다.");
      return;
    }

    const currentLikeStatus = localLikeState[scheduleId] ?? serverLikeStatus;

    logger.debug(
      "🔄 [LIKE ACTION] 로컬상태:",
      localLikeState[scheduleId],
      "서버상태:",
      serverLikeStatus,
      "최종상태:",
      currentLikeStatus,
      "API:",
      currentLikeStatus ? "DELETE" : "POST"
    );

    if (currentLikeStatus === true) {
      setLocalLikeState((prev) => ({ ...prev, [scheduleId]: false }));
      unlikeScheduleMutation.mutate(scheduleId);
    } else {
      setLocalLikeState((prev) => ({ ...prev, [scheduleId]: true }));
      likeScheduleMutation.mutate(scheduleId);
    }
  };

  const currentLikeStatus = scheduleId
    ? (localLikeState[scheduleId] ?? serverLikeStatus ?? false)
    : false;

  return {
    handleLikeToggle,
    isLiked: currentLikeStatus,
  };
};
