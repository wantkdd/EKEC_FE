import { privateAPI } from "./httpClient";
import type {
  RequestCreatePostDto,
  ResponseCreatePostDto,
  RequestUpdatePostDto,
  RequestCreateBulletinComment,
  ResponseCreateBulletinComment,
  ResponseGetBulletinComments,
  BulletinCommentData,
} from "../types/bulletin/types";
import { logger } from "../utils/logger";

// 게시글 생성 API
export const createBulletinApi = async (
  crewId: string,
  data: RequestCreatePostDto
): Promise<ResponseCreatePostDto> => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("userId", data.userId.toString());
  formData.append("type", data.type || "regular");
  formData.append("isRequired", String(data.isRequired ?? true));
  formData.append("allowComment", String(data.allowComment ?? true));
  formData.append(
    "allowPrivateComment",
    String(data.allowPrivateComment ?? true)
  );
  formData.append("allowShare", String(data.allowShare ?? true));

  (data.images || []).forEach((image) => {
    formData.append("images", image);
  });

  const response = await privateAPI.post(`/crew/${crewId}/post/`, formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};

// 게시글 수정 API
export const updateBulletinApi = async (
  crewId: string,
  postId: string,
  data: RequestUpdatePostDto
) => {
  logger.debug("updateBulletinApi 호출", {
    crewId,
    postId,
    data,
  });

  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);

  // 기존 이미지 ID들 추가
  logger.debug("기존 이미지 IDs", { existingImageIds: data.existingImageIds });
  (data.existingImageIds || []).forEach((id) => {
    formData.append("existingImageIds", id.toString());
  });

  // 새 이미지들 추가
  logger.debug("새 이미지들", { images: data.images });
  (data.images || []).forEach((image) => {
    formData.append("images", image);
  });

  const response = await privateAPI.put(
    `/crew/${crewId}/post/${postId}`,
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data;
};

// 게시글 삭제 API
export const deleteBulletinApi = async (crewId: string, postId: string) => {
  const response = await privateAPI.delete(`/crew/${crewId}/post/${postId}`);
  return response.data;
};

// 게시글 좋아요 API (필요시 사용)
export const toggleBulletinLikeApi = async (crewId: string, postId: string) => {
  const response = await privateAPI.post(`/crew/${crewId}/post/${postId}/like`);
  return response.data;
};

import { imageUrlHelpers } from "./image";

// 이미지 URL 변환 함수
export const getImageUrl = (
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
  switch (type) {
    case 0:
      return imageUrlHelpers.banner(fileName);
    case 1:
      return imageUrlHelpers.profile(fileName);
    case 2:
      return imageUrlHelpers.post(fileName);
    case 3:
      return imageUrlHelpers.album(fileName);
    default:
      return imageUrlHelpers.profile(fileName); // 기본값
  }
};

// 게시판 댓글 데이터의 이미지 URL 변환
const transformBulletinCommentData = (
  comment: BulletinCommentData
): BulletinCommentData => ({
  ...comment,
  image: getImageUrl(comment.image, 1),
});

// 게시판 댓글 작성 API 함수
export const createBulletinCommentApi = async (
  crewId: string,
  postId: string,
  data: RequestCreateBulletinComment
): Promise<ResponseCreateBulletinComment> => {
  logger.debug(`[createBulletinCommentApi] Requesting: POST /crew/${crewId}/post/${postId}/comment`);
  logger.debug("[createBulletinCommentApi] data", { data });
  const response = await privateAPI.post<ResponseCreateBulletinComment>(
    `/crew/${crewId}/post/${postId}/comment`,
    data
  );
  logger.debug("[createBulletinCommentApi] response.data", { responseData: response.data });

  // 응답 데이터의 이미지 URL 변환
  if (response.data.data && response.data.data.image) {
    response.data.data.image = getImageUrl(response.data.data.image, 1);
  }

  return response.data;
};

// 게시판 댓글 목록 조회 API 함수
export const getBulletinCommentsApi = async (
  crewId: string,
  postId: string,
  page: number = 1,
  size: number = 10
): Promise<ResponseGetBulletinComments> => {
  logger.debug(
    `[getBulletinCommentsApi] Requesting: GET /crew/${crewId}/post/${postId}/comment?page=${page}&size=${size}`
  );
  const response = await privateAPI.get<ResponseGetBulletinComments>(
    `/crew/${crewId}/post/${postId}/comment/list?page=${page}&size=${size}`
  );
  logger.debug("[getBulletinCommentsApi] response.data", { responseData: response.data });

  // 댓글 데이터의 이미지 URL 변환
  if (response.data.data?.comments) {
    response.data.data.comments = response.data.data.comments.map(
      transformBulletinCommentData
    );
  }

  return response.data;
};

// 게시판 댓글 수정 API 함수
export const updateBulletinCommentApi = async (
  crewId: string,
  postId: string,
  commentId: string,
  data: { content: string; isPublic: number }
): Promise<ResponseCreateBulletinComment> => {
  logger.debug(
    `[updateBulletinCommentApi] Requesting: PUT /crew/${crewId}/post/${postId}/comment/${commentId}`
  );
  logger.debug("[updateBulletinCommentApi] data", { data });
  const response = await privateAPI.put<ResponseCreateBulletinComment>(
    `/crew/${crewId}/post/${postId}/comment/${commentId}`,
    data
  );
  logger.debug("[updateBulletinCommentApi] response.data", { responseData: response.data });

  // 응답 데이터의 이미지 URL 변환
  if (response.data.data && response.data.data.image) {
    response.data.data.image = getImageUrl(response.data.data.image, 1);
  }

  return response.data;
};

// 게시판 댓글 삭제 API 함수
export const deleteBulletinCommentApi = async (
  crewId: string,
  postId: string,
  commentId: string
): Promise<{ resultType: "SUCCESS" | "FAIL"; error: null; data: null }> => {
  logger.debug(
    `[deleteBulletinCommentApi] Requesting: DELETE /crew/${crewId}/post/${postId}/comment/${commentId}`
  );
  const response = await privateAPI.delete<{
    resultType: "SUCCESS" | "FAIL";
    error: null;
    data: null;
  }>(`/crew/${crewId}/post/${postId}/comment/${commentId}`);
  logger.debug("[deleteBulletinCommentApi] response.data", { responseData: response.data });

  return response.data;
};

// 게시글 좋아요 추가 API 함수
export const likeBulletinApi = async (
  crewId: string,
  postId: string
): Promise<{
  resultType: "SUCCESS" | "FAIL";
  error: null;
  data: { likeCount?: number };
}> => {
  logger.debug(
    `[likeBulletinApi] Requesting: POST /crew/${crewId}/post/${postId}/like`
  );
  const response = await privateAPI.post<{
    resultType: "SUCCESS" | "FAIL";
    error: null;
    data: { likeCount?: number };
  }>(`/crew/${crewId}/post/${postId}/like`);
  logger.debug("[likeBulletinApi] response.data", { responseData: response.data });
  return response.data;
};

// 게시글 좋아요 취소 API 함수
export const unlikeBulletinApi = async (
  crewId: string,
  postId: string
): Promise<{
  resultType: "SUCCESS" | "FAIL";
  error: null;
  data: { likeCount?: number };
}> => {
  logger.debug(
    `[unlikeBulletinApi] Requesting: DELETE /crew/${crewId}/post/${postId}/like`
  );
  const response = await privateAPI.post<{
    resultType: "SUCCESS" | "FAIL";
    error: null;
    data: { likeCount?: number };
  }>(`/crew/${crewId}/post/${postId}/like`);
  logger.debug("[unlikeBulletinApi] response.data", { responseData: response.data });
  return response.data;
};
