import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createScheduleApi } from "../../apis/schedule";
import type {
  RequestCreateSchedule,
  ResponseCreateSchedule,
} from "../../types/detail/schedule/types";
import { showSuccess, showError } from "../../utils/toast";
import { logger } from "../../utils/logger";

interface CreateScheduleParams {
  crewId: string;
  scheduleData: RequestCreateSchedule;
}

export const useCreateSchedule = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<ResponseCreateSchedule, Error, CreateScheduleParams>({
    mutationFn: ({ crewId, scheduleData }) =>
      createScheduleApi(crewId, scheduleData),
    onSuccess: (response, { crewId }) => {
      logger.debug("일정 등록 성공", { response });

      if (response.resultType === "SUCCESS") {
        // 일정 목록 캐시 무효화 (새로고침)
        queryClient.invalidateQueries({
          queryKey: ["scheduleList", crewId],
        });

        showSuccess("일정이 성공적으로 등록되었습니다!");
        // 일정 목록 페이지로 이동
        navigate(-1); // 이전 페이지로 돌아가기
      } else {
        logger.error("일정 등록 실패", undefined, { error: response.error });
        showError(response.error?.reason || "일정 등록에 실패했습니다.");
      }
    },
    onError: (error) => {
      logger.error("일정 등록 오류", error);
      showError("일정 등록 중 오류가 발생했습니다.");
    },
  });
};
