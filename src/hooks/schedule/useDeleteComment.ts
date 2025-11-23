import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCommentApi } from "../../apis/schedule";
import type { ResponseScheduleDetail } from "../../types/detail/schedule/types";

interface UseDeleteCommentParams {
  crewId: string;
  planId: string;
  commentId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteComment = ({
  crewId,
  planId,
  commentId,
  onSuccess,
  onError,
}: UseDeleteCommentParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      logger.debug(
        `[useDeleteComment] Deleting comment ${commentId} for crew ${crewId}, plan ${planId}`
      );
      return deleteCommentApi(crewId, planId, commentId);
    },
    onMutate: async () => {
      logger.debug(`[useDeleteComment] onMutate: Starting optimistic update`);
      // 댓글 삭제 시 낙관적 업데이트로 댓글 개수 감소
      const scheduleDetailQueryKey = ["schedule", "detail", crewId, planId];

      await queryClient.cancelQueries({
        queryKey: scheduleDetailQueryKey,
      });

      const previousData = queryClient.getQueryData(scheduleDetailQueryKey);

      queryClient.setQueryData(scheduleDetailQueryKey, (old: ResponseScheduleDetail | undefined) => {
        if (old?.data) {
          return {
            ...old,
            data: {
              ...old.data,
              commentCount: Math.max(0, (old.data.commentCount || 0) - 1),
            },
          };
        }
        return old;
      });

      return { previousData };
    },
    onSuccess: (data) => {
      logger.debug(
        `[useDeleteComment] onSuccess: Comment deleted successfully`,
        data
      );
      // 댓글 목록 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: ["comments", crewId, planId],
      });

      // 일정 상세 정보도 갱신
      queryClient.invalidateQueries({
        queryKey: ["schedule", "detail", crewId, planId],
      });

      onSuccess?.();
    },
    onError: (error, _variables, context) => {
      logger.error(
        `[useDeleteComment] onError: Failed to delete comment`,
        error
      );
      // 오류 발생 시 이전 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["schedule", "detail", crewId, planId],
          context.previousData
        );
      }

      logger.error("[useDeleteComment] Error:", error);
      onError?.(error);
    },
  });
};
