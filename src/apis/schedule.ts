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
} from "../types/detail/schedule/types";
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
const transformUpdatedCommentData = (comment: any): any => ({
  ...comment,
  writerImage: getImageUrl(comment.writerImage, 1),
});

// 일정 데이터의 이미지 URL 변환
const transformScheduleData = (schedule: any): any => ({
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
  console.log("[createScheduleApi] response.data:", response.data);
  return response.data;
};

// 일정 목록 조회 API 함수
export const getScheduleListApi = async (
  crewId: string,
  page: number = 1,
  size: number = 10
): Promise<ResponseScheduleList> => {
  console.log(
    `[getScheduleListApi] Requesting: /crew/${crewId}/plan/list?page=${page}&size=${size}`
  );
  const response = await privateAPI.get<ResponseScheduleList>(
    `/crew/${crewId}/plan/list?page=${page}&size=${size}`
  );
  console.log("[getScheduleListApi] response.data:", response.data);
  return response.data;
};

// 일정 세부 조회 API 함수
export const getScheduleDetailApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleDetail> => {
  console.log(
    `[getScheduleDetailApi] Requesting: /crew/${crewId}/plan/${planId}`
  );
  const response = await privateAPI.get<ResponseScheduleDetail>(
    `/crew/${crewId}/plan/${planId}`
  );
  console.log("[getScheduleDetailApi] Full response:", response);
  console.log("[getScheduleDetailApi] response.data:", response.data);
  console.log(
    "[getScheduleDetailApi] Full data object:",
    JSON.stringify(response.data?.data, null, 2)
  );
  console.log(
    "[getScheduleDetailApi] isLiked field:",
    response.data?.data?.isLiked
  );
  console.log(
    "[getScheduleDetailApi] likeCount field:",
    response.data?.data?.likeCount
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
  console.log(`[updateScheduleApi] Requesting: /crew/${crewId}/plan/${planId}`);
  const response = await privateAPI.put<ResponseUpdateSchedule>(
    `/crew/${crewId}/plan/${planId}`,
    data
  );
  console.log("[updateScheduleApi] response.data:", response.data);
  return response.data;
};

// 일정 삭제 API 함수
export const deleteScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseDeleteSchedule> => {
  console.log(
    `[deleteScheduleApi] Requesting: DELETE /crew/${crewId}/plan/${planId}`
  );
  const response = await privateAPI.delete<ResponseDeleteSchedule>(
    `/crew/${crewId}/plan/${planId}`
  );
  console.log("[deleteScheduleApi] response.data:", response.data);
  return response.data;
};

// 일정 좋아요 추가 API 함수
export const likeScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleLike> => {
  console.log(
    `[likeScheduleApi] Requesting: POST /crew/${crewId}/plan/${planId}/like`
  );
  const response = await privateAPI.post<ResponseScheduleLike>(
    `/crew/${crewId}/plan/${planId}/like`
  );
  console.log("[likeScheduleApi] response.data:", response.data);
  return response.data;
};

// 일정 좋아요 취소 API 함수
export const unlikeScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleUnlike> => {
  console.log(
    `[unlikeScheduleApi] Requesting: DELETE /crew/${crewId}/plan/${planId}/like`
  );
  const response = await privateAPI.delete<ResponseScheduleUnlike>(
    `/crew/${crewId}/plan/${planId}/like`
  );
  console.log("[unlikeScheduleApi] response.data:", response.data);
  return response.data;
};

// 일정 신청 API 함수
export const applyScheduleApi = async (
  crewId: string,
  planId: string
): Promise<ResponseScheduleApply> => {
  console.log(
    `[applyScheduleApi] Requesting: POST /crew/${crewId}/plan/${planId}/apply`
  );
  const response = await privateAPI.post<ResponseScheduleApply>(
    `/crew/${crewId}/plan/${planId}/apply`
  );
  console.log("[applyScheduleApi] response.data:", response.data);
  return response.data;
};

// 댓글 작성 API 함수
export const createCommentApi = async (
  crewId: string,
  planId: string,
  data: RequestCreateComment
): Promise<ResponseCreateComment> => {
  console.log(
    `[createCommentApi] Requesting: POST /crew/${crewId}/plan/${planId}/comments`
  );
  console.log("[createCommentApi] data:", data);
  const response = await privateAPI.post<ResponseCreateComment>(
    `/crew/${crewId}/plan/${planId}/comments`,
    data
  );
  console.log("[createCommentApi] response.data:", response.data);
  return response.data;
};

// 댓글 목록 조회 API 함수
export const getCommentsApi = async (
  crewId: string,
  planId: string,
  page: number = 1,
  size: number = 10
): Promise<ResponseGetComments> => {
  console.log(
    `[getCommentsApi] Requesting: GET /crew/${crewId}/plan/${planId}/comments/list?page=${page}&size=${size}`
  );
  const response = await privateAPI.get<ResponseGetComments>(
    `/crew/${crewId}/plan/${planId}/comments/list?page=${page}&size=${size}`
  );
  console.log("[getCommentsApi] response.data:", response.data);

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
  console.log(
    `[updateCommentApi] Requesting: PATCH /crew/${crewId}/plan/${planId}/comments/${commentId}`
  );
  console.log("[updateCommentApi] data:", data);
  const response = await privateAPI.patch<ResponseUpdateComment>(
    `/crew/${crewId}/plan/${planId}/comments/${commentId}`,
    data
  );
  console.log("[updateCommentApi] response.data:", response.data);

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
  console.log(
    `[deleteCommentApi] Requesting: DELETE /crew/${crewId}/plan/${planId}/comments/${commentId}`
  );

  try {
    const response = await privateAPI.delete<ResponseDeleteComment>(
      `/crew/${crewId}/plan/${planId}/comments/${commentId}`
    );
    console.log("[deleteCommentApi] response.status:", response.status);
    console.log("[deleteCommentApi] response.data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[deleteCommentApi] Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error;
  }
};
