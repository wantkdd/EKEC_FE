import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBulletinApi,
  updateBulletinApi,
  deleteBulletinApi,
} from "../../apis/bulletins";
import { useNavigate } from "react-router-dom";
import type {
  RequestCreatePostDto,
  RequestUpdatePostDto,
  BulletinApiData,
} from "../../types/bulletin/types";
import { showSuccess, showError } from "../../utils/toast";
import { logger } from "../../utils/logger";

// 게시글 생성 훅
export const useCreateBulletin = (crewId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RequestCreatePostDto) => createBulletinApi(crewId, data),
    onSuccess: () => {
      // 게시글 목록 재조회 (정확한 쿼리 키 사용)
      queryClient.invalidateQueries({
        queryKey: ["bulletins", Number(crewId)],
      });
      showSuccess("게시글이 성공적으로 등록되었습니다.");
      navigate(`/crew/${crewId}/bulletin`);
    },
    onError: (error) => {
      logger.error("게시글 생성 실패:", error);
      showError("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    },
  });
};

// 게시글 수정 훅
export const useUpdateBulletin = (crewId: string, postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestUpdatePostDto) =>
      updateBulletinApi(crewId, postId, data),
    onMutate: async (newData) => {
      // 낙관적 업데이트를 위한 이전 데이터 백업
      await queryClient.cancelQueries({
        queryKey: ["bulletin", Number(crewId), Number(postId)],
      });

      const previousData = queryClient.getQueryData([
        "bulletin",
        Number(crewId),
        Number(postId),
      ]);

      // 낙관적 업데이트 적용
      queryClient.setQueryData(
        ["bulletin", Number(crewId), Number(postId)],
        (old: BulletinApiData | undefined) =>
          old
            ? {
                ...old,
                title: newData.title,
                content: newData.content,
              }
            : old
      );

      return { previousData };
    },
    onSuccess: () => {
      // 게시글 상세 정보 재조회
      queryClient.invalidateQueries({
        queryKey: ["bulletin", Number(crewId), Number(postId)],
      });
      // 게시글 목록도 재조회
      queryClient.invalidateQueries({
        queryKey: ["bulletins", Number(crewId)],
      });
    },
    onError: (error, _variables, context) => {
      // 오류 발생 시 이전 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["bulletin", Number(crewId), Number(postId)],
          context.previousData
        );
      }
      logger.error("게시글 수정 실패:", error);
      showError("게시글 수정에 실패했습니다. 다시 시도해주세요.");
    },
    onSettled: () => {
      // 성공/실패와 관계없이 쿼리 다시 가져오기
      queryClient.invalidateQueries({
        queryKey: ["bulletin", Number(crewId), Number(postId)],
      });
    },
  });
};

// 게시글 삭제 훅
export const useDeleteBulletin = (crewId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (postId: string) => deleteBulletinApi(crewId, postId),
    onSuccess: () => {
      // 게시글 목록 재조회 (정확한 쿼리 키 사용)
      queryClient.invalidateQueries({
        queryKey: ["bulletins", Number(crewId)],
      });
      // 게시글 목록 페이지로 이동
      navigate(`/crew/${crewId}/bulletin`);
    },
    onError: (error) => {
      logger.error("게시글 삭제 실패:", error);
      showError("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    },
  });
};
