import { logger } from "../../utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeBulletinApi, unlikeBulletinApi } from "../../apis/bulletins";
import type { BulletinApiData } from "../../types/bulletin/types";

// 좋아요 추가
export function useLikeBulletin(crewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likeBulletinApi(crewId, postId),

    onMutate: async (postId: string) => {
      logger.debug("💙 게시글 좋아요 추가 시작");

      // 기존 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ["bulletin", parseInt(crewId), parseInt(postId)],
      });

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData([
        "bulletin",
        parseInt(crewId),
        parseInt(postId),
      ]);

      // 낙관적 업데이트 : 좋아요 개수 +1, isLiked : true
      if (previousData) {
        queryClient.setQueryData(
          ["bulletin", parseInt(crewId), parseInt(postId)],
          (old: BulletinApiData | undefined) => {
            if (!old) return old;
            return {
              ...old,
              likeCount: (old.likeCount || 0) + 1,
              isLiked: true,
            };
          }
        );
      }

      return { previousData };
    },

    onSuccess: (data, postId) => {
      // 성공 시 isLiked를 true로 설정
      queryClient.setQueryData(
        ["bulletin", parseInt(crewId), parseInt(postId)],
        (old: BulletinApiData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isLiked: true,
            likeCount: data.data?.likeCount || (old.likeCount || 0) + 1,
          };
        }
      );

      // 목록 페이지도 업데이트
      queryClient.invalidateQueries({
        queryKey: ["bulletins", parseInt(crewId)],
      });
    },

    onError: (error, postId, context) => {
      logger.debug("게시글 좋아요 추가 실패", error);
      // 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["bulletin", parseInt(crewId), parseInt(postId)],
          context.previousData
        );
      }

      // 에러가 발생하면 isLiked를 false로 설정 (중복 클릭 방지)
      queryClient.setQueryData(
        ["bulletin", parseInt(crewId), parseInt(postId)],
        (old: BulletinApiData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isLiked: false,
          };
        }
      );
    },
  });
}

// 좋아요 취소
export function useUnlikeBulletin(crewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => unlikeBulletinApi(crewId, postId),

    onMutate: async (postId: string) => {
      // 기존 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ["bulletin", parseInt(crewId), parseInt(postId)],
      });

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData([
        "bulletin",
        parseInt(crewId),
        parseInt(postId),
      ]);

      // 낙관적 업데이트 : 좋아요 개수 -1, isLiked : false
      if (previousData) {
        queryClient.setQueryData(
          ["bulletin", parseInt(crewId), parseInt(postId)],
          (old: BulletinApiData | undefined) => {
            if (!old) return old;
            return {
              ...old,
              likeCount: Math.max((old.likeCount || 0) - 1, 0),
              isLiked: false,
            };
          }
        );
      }

      return { previousData };
    },

    onSuccess: (data, postId) => {
      // 성공 시 isLiked를 false로 설정
      queryClient.setQueryData(
        ["bulletin", parseInt(crewId), parseInt(postId)],
        (old: BulletinApiData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isLiked: false,
            likeCount:
              data.data?.likeCount || Math.max((old.likeCount || 0) - 1, 0),
          };
        }
      );

      // 목록 페이지 업데이트
      queryClient.invalidateQueries({
        queryKey: ["bulletins", parseInt(crewId)],
      });
    },

    onError: (error, postId, context) => {
      logger.debug("게시글 좋아요 취소 실패", error);
      // 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["bulletin", parseInt(crewId), parseInt(postId)],
          context.previousData
        );
      }

      // 에러가 발생하면 isLiked를 true로 설정
      queryClient.setQueryData(
        ["bulletin", parseInt(crewId), parseInt(postId)],
        (old: BulletinApiData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isLiked: true,
          };
        }
      );
    },
  });
}
