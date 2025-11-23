import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCommentApi } from "../../apis/schedule";
import type { RequestUpdateComment } from "../../types/detail/schedule/types";

interface UseUpdateCommentParams {
  crewId: string;
  planId: string;
  commentId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useUpdateComment = ({
  crewId,
  planId,
  commentId,
  onSuccess,
  onError,
}: UseUpdateCommentParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestUpdateComment) =>
      updateCommentApi(crewId, planId, commentId, data),
    onSuccess: () => {
      // 댓글 목록 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: ["comments", crewId, planId],
      });

      onSuccess?.();
    },
    onError: (error) => {
      logger.error("[useUpdateComment] Error:", error);
      onError?.(error);
    },
  });
};
