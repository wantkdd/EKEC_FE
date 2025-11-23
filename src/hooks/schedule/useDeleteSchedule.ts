import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteScheduleApi } from "../../apis/schedule";
import { useNavigate } from "react-router-dom";
import type { ResponseDeleteSchedule } from "../../types/detail/schedule/types";
import { showError } from "../../utils/toast";

interface DeleteScheduleParams {
  crewId: string;
  planId: string;
}

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<ResponseDeleteSchedule, Error, DeleteScheduleParams>({
    mutationFn: ({ crewId, planId }) => deleteScheduleApi(crewId, planId),
    onSuccess: (data, { crewId }) => {
      logger.debug("일정 삭제 성공:", data);

      // 일정 목록과 상세 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["scheduleList", crewId],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduleDetail"],
      });

      // 일정 목록 페이지로 이동
      navigate(`/crew/${crewId}/schedule`);
    },
    onError: (error) => {
      logger.error("일정 삭제 실패:", error);
      showError("일정 삭제에 실패했습니다.");
    },
  });
};
