// 기본 응답 타입
export interface BaseApiResponse<T = unknown> {
  resultType: "SUCCESS" | "FAIL" | "ERROR";
  error?:
    | {
        errorCode: string;
        reason: string;
        data: unknown;
      }
    | string
    | null;
  data?: T;
}

// 이미지 관련 타입
export interface BulletinImage {
  imageId: number;
  imageName: string;
}

// 페이지네이션 타입
export interface Pagination {
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  pageNum: number;
  pageSize: number;
}

// API 응답 타입들
export interface BulletinApiResponse
  extends BaseApiResponse<
    {
      posts: BulletinApiData[];
    } & Pagination
  > {}

export interface BulletinDetailApiResponse
  extends BaseApiResponse<BulletinApiData> {}

export interface BulletinApiData {
  postId: number;
  title: string;
  createdAt: string;
  nickname: string;
  commentCount: number;
  likeCount: number;
  imageCount: number;
  isPopular: boolean;
  userId: number;
  isLiked: boolean;
  // detail 필드들 (optional)
  content?: string;
  profileImage?: string;
  images?: BulletinImage[];
}

// 프론트엔드에서 사용하는 변환된 타입
export interface Bulletin {
  id: number;
  title: string;
  date: string;
  author: string;
  commentCount: number;
  likeCount: number;
  isPopular?: boolean;
  hasAttachment?: boolean;
  userId?: number;
  isLiked?: boolean;
  // detail 필드들
  content?: string;
  profileImage?: string;
  images?: string[];
  originalImages?: BulletinImage[];
}

export interface BulletinListResponse {
  bulletins: Bulletin[];
  pagination: Pagination;
}

// 기본 게시글 데이터 타입
export interface BaseBulletinData {
  title: string;
  content: string;
  userId: number;
  type?: string;
  isRequired?: boolean;
  allowComment?: boolean;
  allowPrivateComment?: boolean;
  allowShare?: boolean;
}

// 생성 요청 타입 (기본 데이터 + 이미지)
export interface RequestCreatePostDto extends BaseBulletinData {
  images?: File[];
}

// 수정 요청 타입 (기본 데이터 + 이미지 + 기존 이미지 ID)
export interface RequestUpdatePostDto extends BaseBulletinData {
  images?: File[];
  existingImageIds?: number[];
}

// 생성/수정 응답 타입
export interface ResponseCreatePostDto
  extends BaseApiResponse<BulletinApiData> {}
export interface ResponseUpdatePostDto
  extends BaseApiResponse<BulletinApiData> {}

// 댓글 관련 타입들
export interface BulletinCommentData {
  commentId: number;
  content: string;
  nickname: string;
  image: string | null;
  userId: number;
  isPublic: number; // 0: 전체 공개, 1: 비밀 댓글
  createdAt: string;
}

// 댓글 목록 조회 응답 타입
export interface ResponseGetBulletinComments {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  data: {
    comments: BulletinCommentData[];
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    pageNum: number;
    pageSize: number;
  } | null;
}

// 댓글 작성 요청 타입
export interface RequestCreateBulletinComment {
  content: string;
  isPublic: number; // 0: 전체 공개, 1: 비밀 댓글
}

// 댓글 작성 응답 데이터 타입
export interface CreatedBulletinCommentData {
  commentId: number;
  content: string;
  nickname: string;
  image: string | null;
  isPublic: number;
  createdAt: string;
}

// 댓글 작성 응답 타입
export interface ResponseCreateBulletinComment {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  data: CreatedBulletinCommentData | null;
}
