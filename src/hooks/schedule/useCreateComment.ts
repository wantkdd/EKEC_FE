import { logger } from "../../utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommentApi } from "../../apis/schedule";
import type {
  RequestCreateComment,
  ResponseScheduleDetail,
} from "../../types/detail/schedule/types";

export const useCreateComment = (crewId: string, planId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestCreateComment) =>
      createCommentApi(crewId, planId, data),
    onMutate: async () => {
      // 관련 쿼리들을 취소하여 낙관적 업데이트와 충돌 방지
      await queryClient.cancelQueries({
        queryKey: ["scheduleDetail", crewId, planId],
      });

      // 이전 데이터 백업
      const previousScheduleDetail = queryClient.getQueryData([
        "scheduleDetail",
        crewId,
        planId,
      ]);

      // 낙관적 업데이트: 댓글 수 +1
      queryClient.setQueryData(
        ["scheduleDetail", crewId, planId],
        (old: ResponseScheduleDetail | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              commentCount: (old.data.commentCount || 0) + 1,
            },
          };
        }
      );

      return { previousScheduleDetail };
    },
    onSuccess: () => {
      // 댓글 작성 성공 시 댓글 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: ["comments", crewId, planId],
      });
      // 일정 상세 정보 무효화 (댓글 수)
      queryClient.invalidateQueries({
        queryKey: ["scheduleDetail", crewId, planId],
      });
    },
    onError: (error, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousScheduleDetail) {
        queryClient.setQueryData(
          ["scheduleDetail", crewId, planId],
          context.previousScheduleDetail
        );
      }
      logger.error("댓글 작성 실패:", error);
    },
  });
};
