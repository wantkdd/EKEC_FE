// 일정 타입 (0: 정기, 1: 특별)
export type ScheduleType = 0 | 1;

// 일정 등록 요청 타입
export interface RequestCreateSchedule {
  title: string;
  content: string;
  day: string;
  type: ScheduleType;
  isRequired: boolean;
  allowComments: boolean;
  allowPrivateComments: boolean;
  allowExternalShare: boolean;
  hasFee: boolean;
  fee: number;
  feePurpose: string;
}

// 일정 등록 응답 데이터 타입
export interface ScheduleData {
  id: number;
  crew_name: string;
  writer: string;
  writerImage?: string | null;
  title: string;
  content: string;
  day: string;
  type: ScheduleType;
  isRequired: boolean;
  allowComments: boolean;
  allowPrivateComments: boolean;
  allowExternalShare: boolean;
  hasFee: boolean;
  fee: number;
  feePurpose: string;
  createdAt: string;
}

// 일정 등록 응답 타입
export interface ResponseCreateSchedule {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data: unknown;
  };
  data: ScheduleData | null;
}

// 일정 아이템 응답 타입
export interface ScheduleItem {
  id: number;
  crew_name: string;
  writer: string;
  writerImage?: string | null;
  title: string;
  content: string;
  day: string;
  type: ScheduleType;
  isRequired: boolean;
  allowComments: boolean;
  allowPrivateComments: boolean;
  allowExternalShare: boolean;
  hasFee: boolean;
  fee: number;
  feePurpose: string;
  commentCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string | null;
  userId?: number;
  isLiked?: boolean;
  isApplied?: boolean;
}

export interface PaginationInfo {
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ScheduleListData {
  plans: ScheduleItem[];
  pagination: PaginationInfo;
}

// 일정 목록 조회 응답 타입
export interface ResponseScheduleList {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data: unknown;
  };
  data: ScheduleListData;
}

// 일정 세부 조회 응답 타입
export interface ResponseScheduleDetail {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data: unknown;
  };
  data: ScheduleItem;
}

// 일정 수정 요청 타입
export type RequestUpdateSchedule = RequestCreateSchedule;

// 일정 수정 응답 타입
export interface ResponseUpdateSchedule {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data: unknown;
  };
  success: ScheduleItem | null;
}

// 일정 삭제 응답 타입
export interface ResponseDeleteSchedule {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data: unknown;
  };
  data: null;
}

// 일정 좋아요 관련 응답 데이터 타입
export interface ScheduleLikeData {
  message?: string;
  planId: number;
  likeCount?: number;
  isLiked?: boolean;
  crewId?: number;
  userId?: number;
}

// 일정 좋아요 응답 타입
export interface ResponseScheduleLike {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: ScheduleLikeData;
  };
  data: ScheduleLikeData | null;
}

// 일정 좋아요 취소 응답 타입
export type ResponseScheduleUnlike = ResponseScheduleLike;

// 일정 신청 응답 데이터 타입
export interface ScheduleApplyData {
  message?: string;
  planId: number;
  status: 0 | 1; // 0: 미신청, 1: 신청완료
  applicant?: string;
  crewId?: number;
  memberId?: number;
}

// 일정 신청 응답 타입
export interface ResponseScheduleApply {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: ScheduleApplyData | null;
}

// 댓글 작성 요청 타입
export interface RequestCreateComment {
  content: string;
  isPublic: boolean; // true: 공개, false: 비공개
}

// 댓글 데이터 타입
export interface CommentData {
  id: number;
  content: string;
  userId: number;
  writer: string;
  writerImage: string | null;
  isPublic: boolean;
  createdAt: string;
}

// 댓글 작성 응답 타입
export interface ResponseCreateComment {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  data: CommentData | null;
}

// 댓글 목록 조회 요청 파라미터 타입
export interface RequestGetComments {
  crewId: string;
  planId: string;
  page?: number;
  size?: number;
}

// 페이지네이션 타입
export interface Pagination {
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 댓글 목록 조회 응답 타입
export interface ResponseGetComments {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  data: {
    comments: CommentData[];
    pagination: Pagination;
  } | null;
}

// 댓글 수정 요청 타입
export interface RequestUpdateComment {
  content: string;
}

// 댓글 수정 응답 데이터 타입
export interface UpdatedCommentData {
  id: number;
  content: string;
  writer: string;
  writerImage: string | null;
  createdAt: string;
  updatedAt: string;
}

// 댓글 수정 응답 타입
export interface ResponseUpdateComment {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  data: UpdatedCommentData | null;
}

// 댓글 삭제 응답 타입
export interface ResponseDeleteComment {
  resultType: "SUCCESS" | "FAIL";
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  data: null;
}
