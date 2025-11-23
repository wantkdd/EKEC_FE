import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeScheduleApi, unlikeScheduleApi } from "../../apis/schedule";
import type { ResponseScheduleDetail } from "../../types/detail/schedule/types";

// 좋아요 추가
export function useLikeSchedule(crewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => likeScheduleApi(crewId, planId),

    onMutate: async (planId: string) => {
      logger.debug("💙 좋아요 추가 시작");

      // 기존 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ["scheduleDetail", crewId, planId],
      });

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData([
        "scheduleDetail",
        crewId,
        planId,
      ]);

      // 낙관적 업데이트 : 좋아요 개수 +1, isLiked : true
      if (previousData) {
        queryClient.setQueryData(
          ["scheduleDetail", crewId, planId],
          (old: ResponseScheduleDetail | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                likeCount: (old.data.likeCount || 0) + 1,
                isLiked: true,
              },
            };
          }
        );
      }

      return { previousData };
    },

    onSuccess: (data, planId) => {
      // 성공 시 isLiked를 true로 설정
      queryClient.setQueryData(
        ["scheduleDetail", crewId, planId],
        (old: ResponseScheduleDetail | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isLiked: true,
              likeCount: data.data?.likeCount || (old.data.likeCount || 0) + 1,
            },
          };
        }
      );

      // 목록 페이지도 업데이트
      queryClient.invalidateQueries({
        queryKey: ["scheduleList", crewId],
      });
    },

    onError: (error, planId, context) => {
      logger.debug("좋아요 추가 실패", error);
      // 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["scheduleDetail", crewId, planId],
          context.previousData
        );
      }

      // 에러가 발생하면 isLiked를 false로 설정 (중복 클릭 방지)
      queryClient.setQueryData(
        ["scheduleDetail", crewId, planId],
        (old: ResponseScheduleDetail | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isLiked: false,
            },
          };
        }
      );
    },
  });
}

// 좋아요 취소
export function useUnlikeSchedule(crewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => unlikeScheduleApi(crewId, planId),

    onMutate: async (planId: string) => {
      // 기존 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ["scheduleDetail", crewId, planId],
      });

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData([
        "scheduleDetail",
        crewId,
        planId,
      ]);

      // 낙관적 업데이트 : 좋아요 개수 -1, isLiked : false
      if (previousData) {
        queryClient.setQueryData(
          ["scheduleDetail", crewId, planId],
          (old: ResponseScheduleDetail | undefined) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                likeCount: Math.max((old.data.likeCount || 0) - 1, 0),
                isLiked: false,
              },
            };
          }
        );
      }

      return { previousData };
    },

    onSuccess: (data, planId) => {
      // 성공 시 isLiked를 false로 설정
      queryClient.setQueryData(
        ["scheduleDetail", crewId, planId],
        (old: ResponseScheduleDetail | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isLiked: false,
              likeCount:
                data.data?.likeCount ||
                Math.max((old.data.likeCount || 0) - 1, 0),
            },
          };
        }
      );

      // 목록 페이지 업데이트
      queryClient.invalidateQueries({
        queryKey: ["scheduleList", crewId],
      });
    },

    onError: (error, planId, context) => {
      logger.debug("좋아요 추가 실패", error);
      // 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["scheduleDetail", crewId, planId],
          context.previousData
        );
      }

      // 에러가 발생하면 isLiked를 true로 설정
      queryClient.setQueryData(
        ["scheduleDetail", crewId, planId],
        (old: ResponseScheduleDetail | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isLiked: true,
            },
          };
        }
      );
    },
  });
}
