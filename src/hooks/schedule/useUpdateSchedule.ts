import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateScheduleApi } from "../../apis/schedule";
import type {
  RequestUpdateSchedule,
  ResponseUpdateSchedule,
} from "../../types/detail/schedule/types";
import { showSuccess, showError } from "../../utils/toast";
import { logger } from "../../utils/logger";

interface UpdateScheduleParams {
  crewId: string;
  planId: string;
  scheduleData: RequestUpdateSchedule;
}

export const useUpdateSchedule = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<ResponseUpdateSchedule, Error, UpdateScheduleParams>({
    mutationFn: ({ crewId, planId, scheduleData }) =>
      updateScheduleApi(crewId, planId, scheduleData),
    onSuccess: (response, { crewId, planId }) => {
      logger.debug("일정 수정 성공", { response });

      if (response.resultType === "SUCCESS") {
        // 일정 목록 및 세부 정보 캐시 무효화 (새로고침)
        queryClient.invalidateQueries({
          queryKey: ["scheduleList", crewId],
        });
        queryClient.invalidateQueries({
          queryKey: ["scheduleDetail", crewId, planId],
        });

        showSuccess("일정이 성공적으로 수정되었습니다!");
        // 일정 세부 페이지로 돌아가기
        navigate(-1);
      } else {
        logger.error("일정 수정 실패", undefined, { error: response.error });
        showError(response.error?.reason || "일정 수정에 실패했습니다.");
      }
    },
    onError: (error) => {
      logger.error("일정 수정 오류", error);
      showError("일정 수정 중 오류가 발생했습니다.");
    },
  });
};
