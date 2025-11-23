import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBulletinCommentApi } from "../../apis/bulletins";
import type { BulletinApiData } from "../../types/bulletin/types";

export const useDeleteBulletinComment = (crewId: string, postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => {
      logger.debug(
        `[useDeleteBulletinComment] Deleting comment ${commentId} for crew ${crewId}, post ${postId}`
      );
      return deleteBulletinCommentApi(crewId, postId, commentId);
    },
    onMutate: async () => {
      logger.debug(
        `[useDeleteBulletinComment] onMutate: Starting optimistic update`
      );
      // 관련 쿼리들을 취소하여 낙관적 업데이트와 충돌 방지
      await queryClient.cancelQueries({
        queryKey: ["bulletin", parseInt(crewId), parseInt(postId)],
      });

      // 이전 데이터 백업
      const previousBulletinDetail = queryClient.getQueryData([
        "bulletin",
        parseInt(crewId),
        parseInt(postId),
      ]);

      // 낙관적 업데이트: 댓글 수 -1
      queryClient.setQueryData(
        ["bulletin", parseInt(crewId), parseInt(postId)],
        (old: BulletinApiData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            commentCount: Math.max(0, (old.commentCount || 0) - 1),
          };
        }
      );

      return { previousBulletinDetail };
    },
    onSuccess: () => {
      logger.debug(`[useDeleteBulletinComment] onSuccess: Deletion successful`);
      // 댓글 삭제 성공 시 댓글 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: ["bulletinComments", crewId, postId],
      });
      // 게시글 상세 정보 무효화 (댓글 수)
      queryClient.invalidateQueries({
        queryKey: ["bulletin", parseInt(crewId), parseInt(postId)],
      });
      // 게시판 리스트 무효화 (댓글 수)
      queryClient.invalidateQueries({
        queryKey: ["bulletins", parseInt(crewId)],
      });
    },
    onError: (error, _variables, context) => {
      logger.error(`[useDeleteBulletinComment] onError:`, error);
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousBulletinDetail) {
        queryClient.setQueryData(
          ["bulletin", parseInt(crewId), parseInt(postId)],
          context.previousBulletinDetail
        );
      }
      logger.error("댓글 삭제 실패:", error);
    },
  });
};
