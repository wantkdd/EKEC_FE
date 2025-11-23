import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBulletinCommentApi } from "../../apis/bulletins";
import { showError } from "../../utils/toast";
import type { ResponseGetBulletinComments, BulletinCommentData } from "../../types/bulletin/types";

export const useUpdateBulletinComment = (crewId: string, postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: { content: string; isPublic: number };
    }) => {
      logger.debug(
        `[useUpdateBulletinComment] Updating comment ${commentId} for crew ${crewId}, post ${postId}`
      );
      return updateBulletinCommentApi(crewId, postId, commentId, data);
    },
    onMutate: async (variables) => {
      // 관련 쿼리들을 취소하여 낙관적 업데이트와 충돌 방지
      await queryClient.cancelQueries({
        queryKey: ["bulletinComments", crewId, postId],
      });

      // 이전 댓글 목록 데이터 백업
      const previousComments = queryClient.getQueryData([
        "bulletinComments",
        crewId,
        postId,
      ]);

      // 낙관적 업데이트: 댓글 내용 즉시 업데이트
      queryClient.setQueryData(
        ["bulletinComments", crewId, postId],
        (old: ResponseGetBulletinComments | undefined) => {
          if (!old?.data?.comments) return old;
          return {
            ...old,
            data: {
              ...old.data,
              comments: old.data.comments.map((comment: BulletinCommentData) =>
                comment.commentId.toString() === variables.commentId
                  ? {
                      ...comment,
                      content: variables.data.content,
                      isPublic: variables.data.isPublic,
                    }
                  : comment
              ),
            },
          };
        }
      );

      return { previousComments };
    },
    onSuccess: () => {
      logger.debug(`[useUpdateBulletinComment] Comment updated successfully`);
      // 댓글 목록 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: ["bulletinComments", crewId, postId],
      });
    },
    onError: (error, _variables, context) => {
      logger.error(
        `[useUpdateBulletinComment] Failed to update comment`,
        error
      );
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["bulletinComments", crewId, postId],
          context.previousComments
        );
      }
      showError("댓글 수정에 실패했습니다.");
    },
  });
};
