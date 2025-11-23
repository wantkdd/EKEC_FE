import { privateAPI } from "./httpClient";
import type {
  RequestCreateSchedule,
  ResponseCreateSchedule,
  ResponseScheduleList,
  ResponseScheduleDetail,
  RequestUpdateSchedule,
  ResponseUpdateSchedule,
  ResponseDeleteSchedule,
  ResponseScheduleLike,
  ResponseScheduleUnlike,
  ResponseScheduleApply,
  RequestCreateComment,
  ResponseCreateComment,
  ResponseGetComments,
  RequestUpdateComment,
  ResponseUpdateComment,
  ResponseDeleteComment,
  CommentData,
  ScheduleItem,
} from "../types/detail/schedule/types";
import { logger } from "../utils/logger";
// image helpers 제거 (원복)

// 이미지 URL 변환 함수
const getImageUrl = (
  fileName?: string | null,
  type: number = 1
): string | null => {
  if (!fileName || !fileName.trim()) {
    return null;
  }

  // 이미 완전한 URL인 경우
  if (fileName.startsWith("http")) {
    return fileName;
  }

  // 파일명만 있는 경우 이미지 API로 변환
  return `${import.meta.env.VITE_API_BASE_URL}/image/?type=${type}&fileName=${encodeURIComponent(fileName)}`;
};

// 댓글 데이터의 이미지 URL 변환
const transformCommentData = (comment: CommentData): CommentData => ({
  ...comment,
  writerImage: getImageUrl(comment.writerImage, 1),
});

// 수정된 댓글 데이터의 이미지 URL 변환
const transformUpdatedCommentData = (comment: CommentData): CommentData => ({
  ...comment,
  writerImage: getImageUrl(comment.writerImage, 1),
});

// 일정 데이터의 이미지 URL 변환
const transformScheduleData = (schedule: ScheduleItem): ScheduleItem => ({
  ...schedule,
  writerImage: getImageUrl(schedule.writerImage, 1),
});

// 일정 등록 API 함수
export const createScheduleApi = async (
  crewId: string,
  data: RequestCreateSchedule
): Promise<ResponseCreateSchedule> => {
  const response = await privateAPI.post<ResponseCreateSchedule>(
    `/crew/${crewId}/plan/`,
    data
  );
  logger.debug("[createScheduleApi] response.data", { responseData: response.data });
  return response.data;
};

// 일정 목록 조회 API 함수
export const getScheduleListApi = async (
  crewId: string,
  page: number = 1,
  size: number = 10
): Promise<ResponseScheduleList> => {
  logger.debug(
    `[getScheduleListApi] Requesting: /crew/${crewId}/plan/list?page=${page}&size=${size}`
  );
  const response = await privateAPI.get<ResponseScheduleList>(
    `/crew/${crewId}/plan/list?page=${page}&size=${size}`
  );
  logger.debug("[getScheduleListApi] response.data", { responseData: response.data });
  return response.data;
};

// 일정 세부 조회 API 함수
export const getScheduleDetailApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleDetail> => {
  logger.debug(
    `[getScheduleDetailApi] Requesting: /crew/${crewId}/plan/${planId}`
  );
  const response = await privateAPI.get<ResponseScheduleDetail>(
    `/crew/${crewId}/plan/${planId}`
  );
  logger.debug("[getScheduleDetailApi] Full response", { response });
  logger.debug("[getScheduleDetailApi] response.data", { responseData: response.data });
  logger.debug(
    "[getScheduleDetailApi] Full data object",
    { data: JSON.stringify(response.data?.data, null, 2) }
  );
  logger.debug(
    "[getScheduleDetailApi] isLiked field",
    { isLiked: response.data?.data?.isLiked }
  );
  logger.debug(
    "[getScheduleDetailApi] likeCount field",
    { likeCount: response.data?.data?.likeCount }
  );

  // 일정 데이터의 이미지 URL 변환
  if (response.data.data) {
    response.data.data = transformScheduleData(response.data.data);
  }

  return response.data;
};

// 일정 수정 API 함수
export const updateScheduleApi = async (
  crewId: string,
  planId: string,
  data: RequestUpdateSchedule
): Promise<ResponseUpdateSchedule> => {
  logger.debug(`[updateScheduleApi] Requesting: /crew/${crewId}/plan/${planId}`);
  const response = await privateAPI.put<ResponseUpdateSchedule>(
    `/crew/${crewId}/plan/${planId}`,
    data
  );
  logger.debug("[updateScheduleApi] response.data", { responseData: response.data });
  return response.data;
};

// 일정 삭제 API 함수
export const deleteScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseDeleteSchedule> => {
  logger.debug(
    `[deleteScheduleApi] Requesting: DELETE /crew/${crewId}/plan/${planId}`
  );
  const response = await privateAPI.delete<ResponseDeleteSchedule>(
    `/crew/${crewId}/plan/${planId}`
  );
  logger.debug("[deleteScheduleApi] response.data", { responseData: response.data });
  return response.data;
};

// 일정 좋아요 추가 API 함수
export const likeScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleLike> => {
  logger.debug(
    `[likeScheduleApi] Requesting: POST /crew/${crewId}/plan/${planId}/like`
  );
  const response = await privateAPI.post<ResponseScheduleLike>(
    `/crew/${crewId}/plan/${planId}/like`
  );
  logger.debug("[likeScheduleApi] response.data", { responseData: response.data });
  return response.data;
};

// 일정 좋아요 취소 API 함수
export const unlikeScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleUnlike> => {
  logger.debug(
    `[unlikeScheduleApi] Requesting: DELETE /crew/${crewId}/plan/${planId}/like`
  );
  const response = await privateAPI.delete<ResponseScheduleUnlike>(
    `/crew/${crewId}/plan/${planId}/like`
  );
  logger.debug("[unlikeScheduleApi] response.data", { responseData: response.data });
  return response.data;
};

// 일정 신청 API 함수
export const applyScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleApply> => {
  logger.debug(
    `[applyScheduleApi] Requesting: POST /crew/${crewId}/plan/${planId}/apply`
  );
  const response = await privateAPI.post<ResponseScheduleApply>(
    `/crew/${crewId}/plan/${planId}/apply`
  );
  logger.debug("[applyScheduleApi] response.data", { responseData: response.data });
  return response.data;
};

// 댓글 작성 API 함수
export const createCommentApi = async (
  crewId: string,
  planId: string,
  data: RequestCreateComment
): Promise<ResponseCreateComment> => {
  logger.debug(
    `[createCommentApi] Requesting: POST /crew/${crewId}/plan/${planId}/comments`
  );
  logger.debug("[createCommentApi] data", { data });
  const response = await privateAPI.post<ResponseCreateComment>(
    `/crew/${crewId}/plan/${planId}/comments`,
    data
  );
  logger.debug("[createCommentApi] response.data", { responseData: response.data });
  return response.data;
};

// 댓글 목록 조회 API 함수
export const getCommentsApi = async (
  crewId: string,
  planId: string,
  page: number = 1,
  size: number = 10
): Promise<ResponseGetComments> => {
  logger.debug(
    `[getCommentsApi] Requesting: GET /crew/${crewId}/plan/${planId}/comments/list?page=${page}&size=${size}`
  );
  const response = await privateAPI.get<ResponseGetComments>(
    `/crew/${crewId}/plan/${planId}/comments/list?page=${page}&size=${size}`
  );
  logger.debug("[getCommentsApi] response.data", { responseData: response.data });

  // 댓글 데이터의 이미지 URL 변환
  if (response.data.data?.comments) {
    response.data.data.comments =
      response.data.data.comments.map(transformCommentData);
  }

  return response.data;
};

// 댓글 수정 API 함수
export const updateCommentApi = async (
  crewId: string,
  planId: string,
  commentId: number,
  data: RequestUpdateComment
): Promise<ResponseUpdateComment> => {
  logger.debug(
    `[updateCommentApi] Requesting: PATCH /crew/${crewId}/plan/${planId}/comments/${commentId}`
  );
  logger.debug("[updateCommentApi] data", { data });
  const response = await privateAPI.patch<ResponseUpdateComment>(
    `/crew/${crewId}/plan/${planId}/comments/${commentId}`,
    data
  );
  logger.debug("[updateCommentApi] response.data", { responseData: response.data });

  // 댓글 데이터의 이미지 URL 변환
  if (response.data.data) {
    response.data.data = transformUpdatedCommentData(response.data.data);
  }

  return response.data;
};

// 댓글 삭제 API 함수
export const deleteCommentApi = async (
  crewId: string,
  planId: string,
  commentId: number
): Promise<ResponseDeleteComment> => {
  logger.debug(
    `[deleteCommentApi] Requesting: DELETE /crew/${crewId}/plan/${planId}/comments/${commentId}`
  );

  try {
    const response = await privateAPI.delete<ResponseDeleteComment>(
      `/crew/${crewId}/plan/${planId}/comments/${commentId}`
    );
    logger.debug("[deleteCommentApi] response.status", { status: response.status });
    logger.debug("[deleteCommentApi] response.data", { responseData: response.data });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { message?: string; response?: { status?: number; statusText?: string; data?: unknown; headers?: unknown } };
      logger.error("[deleteCommentApi] Error details", error, {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
      });
    } else {
      logger.error("[deleteCommentApi] Error details", error);
    }
    throw error;
  }
};
