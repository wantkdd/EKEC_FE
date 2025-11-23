import { logger } from "../../utils/logger";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyScheduleApi } from "../../apis/schedule";
import { showError } from "../../utils/toast";
import type { ResponseScheduleDetail, ResponseScheduleList, ScheduleItem } from "../../types/detail/schedule/types";

export const useScheduleApply = (crewId: string, scheduleId: string) => {
  const queryClient = useQueryClient();
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const applyMutation = useMutation({
    mutationFn: () => applyScheduleApi(crewId, scheduleId),
    onMutate: async () => {
      // 낙관적 업데이트를 위해 이전 데이터 백업
      await queryClient.cancelQueries({
        queryKey: ["schedule", crewId, scheduleId],
      });
      await queryClient.cancelQueries({
        queryKey: ["scheduleDetail", crewId, scheduleId],
      });
      await queryClient.cancelQueries({
        queryKey: ["schedules", crewId],
      });

      const previousScheduleData = queryClient.getQueryData([
        "schedule",
        crewId,
        scheduleId,
      ]);

      const previousScheduleDetailData = queryClient.getQueryData([
        "scheduleDetail",
        crewId,
        scheduleId,
      ]);

      const previousSchedulesData = queryClient.getQueryData([
        "schedules",
        crewId,
      ]);

      // 상세 페이지 낙관적 업데이트: 즉시 isApplied를 true로 변경
      queryClient.setQueryData(["schedule", crewId, scheduleId], (old: ResponseScheduleDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isApplied: true,
          },
        };
      });

      // scheduleDetail 쿼리도 함께 업데이트
      queryClient.setQueryData(
        ["scheduleDetail", crewId, scheduleId],
        (old: ResponseScheduleDetail | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isApplied: true,
            },
          };
        }
      );

      // 스케줄 리스트 낙관적 업데이트: 해당 일정의 isApplied를 true로 변경
      queryClient.setQueryData(["schedules", crewId], (old: ResponseScheduleList | undefined) => {
        if (!old?.data?.plans) return old;
        return {
          ...old,
          data: {
            ...old.data,
            plans: old.data.plans.map((plan: ScheduleItem) =>
              plan.id === parseInt(scheduleId)
                ? { ...plan, isApplied: true }
                : plan
            ),
          },
        };
      });

      return {
        previousScheduleData,
        previousScheduleDetailData,
        previousSchedulesData,
      };
    },
    onSuccess: () => {
      // 모달을 먼저 표시하고 버튼을 숨김
      setShowApplyButton(false);
      setShowCompleteModal(true);
    },
    onError: (error, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousScheduleData) {
        queryClient.setQueryData(
          ["schedule", crewId, scheduleId],
          context.previousScheduleData
        );
      }
      if (context?.previousScheduleDetailData) {
        queryClient.setQueryData(
          ["scheduleDetail", crewId, scheduleId],
          context.previousScheduleDetailData
        );
      }
      if (context?.previousSchedulesData) {
        queryClient.setQueryData(
          ["schedules", crewId],
          context.previousSchedulesData
        );
      }
      logger.error("일정 신청 실패:", error);
      showError("일정 신청에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleApplyClick = (isApplied: boolean) => {
    if (isApplied) return;
    setShowApplyButton(true);
  };

  const handleConfirmApply = () => {
    if (!applyMutation.isPending) {
      applyMutation.mutate();
    }
  };

  const handleCancelApply = () => {
    setShowApplyButton(false);
  };

  const handleCloseModal = () => {
    setShowCompleteModal(false);
    // 모달을 닫을 때 서버 데이터로 최종 동기화
    queryClient.invalidateQueries({
      queryKey: ["schedule", crewId, scheduleId],
    });
    queryClient.invalidateQueries({
      queryKey: ["scheduleDetail", crewId, scheduleId],
    });
    queryClient.invalidateQueries({
      queryKey: ["schedules", crewId],
    });
  };

  return {
    showApplyButton,
    showCompleteModal,
    applyMutation,
    handleApplyClick,
    handleConfirmApply,
    handleCancelApply,
    handleCloseModal,
  };
};
