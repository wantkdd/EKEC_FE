import { useQuery } from "@tanstack/react-query";
import { privateAPI } from '../../apis/httpClient';
import type {
  BulletinApiResponse,
  BulletinDetailApiResponse,
  BulletinApiData,
  Bulletin,
  BulletinListResponse,
} from "../../types/bulletin/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getImageUrl = (imageName: string): string => {
  return `${API_BASE_URL}/image?type=2&fileName=${imageName}`;
};

// 프로필 이미지 URL 변환 함수
const getProfileImageUrl = (
  fileName?: string | null,
  type: number = 1
): string | undefined => {
  if (!fileName || !fileName.trim()) {
    return undefined;
  }

  return `${API_BASE_URL}/image/?type=${type}&fileName=${encodeURIComponent(fileName)}`;
};

// 날짜 포맷
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 게시글 데이터 변환 함수
const transformBulletinData = (data: BulletinApiData): Bulletin => ({
  id: data.postId,
  title: data.title,
  date: formatDate(data.createdAt),
  author: data.nickname,
  commentCount: data.commentCount,
  likeCount: data.likeCount || 0,
  isPopular: data.isPopular,
  hasAttachment: (data.imageCount || 0) > 0,
  userId: data.userId,
  isLiked: data.isLiked,
  content: data.content,
  profileImage: getProfileImageUrl(data.profileImage, 1),
  images: data.images?.map((img) => getImageUrl(img.imageName)) || [],
  originalImages: data.images || [],
});

// 게시글 목록 조회
export const useBulletins = (crewId: number, page = 1, size = 10) => {
  return useQuery({
    queryKey: ["bulletins", crewId, page, size],
    queryFn: async (): Promise<BulletinListResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/crew/${crewId}/post/list?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BulletinApiResponse = await response.json();

      if (result.resultType !== "SUCCESS") {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.reason || "게시글을 불러오는데 실패했습니다."
        );
      }

      const data = result.data;
      if (!data) {
        throw new Error("게시글 데이터를 찾을 수 없습니다.");
      }

      return {
        bulletins: data.posts.map(transformBulletinData),
        pagination: {
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          pageNum: data.pageNum,
          pageSize: data.pageSize,
        },
      };
    },
    enabled: !!crewId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};

// 게시글 상세 조회
export const useBulletin = (crewId: number, postId: number) => {
  return useQuery({
    queryKey: ["bulletin", crewId, postId],
    queryFn: async (): Promise<Bulletin> => {
      const response = await privateAPI.get<BulletinDetailApiResponse>(
        `/crew/${crewId}/post/${postId}`
      );

      const result = response.data;

      if (result.resultType !== "SUCCESS") {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.reason || "게시글을 불러오는데 실패했습니다."
        );
      }

      const data = result.data;
      if (!data) {
        throw new Error("게시글 데이터를 찾을 수 없습니다.");
      }

      return transformBulletinData(data);
    },
    enabled: !!(crewId && postId),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};

// 별칭 추가 (기존 코드 호환성을 위해)
export const useBulletinDetail = useBulletin;
