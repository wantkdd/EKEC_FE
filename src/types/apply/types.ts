// src/types/apply/types.ts

/** =========================
 *  공통 상수 & 타입
 *  ========================= */

/** 라벨 + 값 구조 (드롭다운, 라디오, 체크박스 등) */
export type ApplyOption = { label: string; value: number };

/** 크루장이 설정하는 성별 옵션 */
export const crewGenderOptions: ApplyOption[] = [
  { label: "성별 제한 없음", value: 0 },
  { label: "남성", value: 1 },
  { label: "여성", value: 2 },
];

/** 지원자가 선택하는 성별 옵션 */
export const applicantGenderOptions: ApplyOption[] = [
  { label: "남성", value: 1 },
  { label: "여성", value: 2 },
  { label: "밝히지 않음", value: 0 },
];

/** =========================
 *  서버 ↔ 프론트 데이터 구조
 *  ========================= */

export const QUESTION_TYPE = {
  CHECKBOX: 0,
  LONG_TEXT: 1,
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

export type ChoiceList = { list?: string[] } | {};

export type ApiStep1 = {
  gender: number; // 0: 제한 없음, 1: 남성, 2: 여성
  styles: number[];
  activities: number[];
  region: number;
  category: number;
  age: number;
  startDate?: string; // 모집 시작일
  endDate?: string; // 모집 마감일
  createdBy?: number; // 크루장 ID
};

export type ApiQuestion = {
  id: number;
  question: string;
  questionType: QuestionType; // 0 | 1
  choiceList: ChoiceList; // { list?: string[] } | {}
  isEtc: 0 | 1; // 체크박스 '기타' 입력란 여부
  required: 0 | 1; // 필수 여부
};

export type ApiSuccess = {
  step1: ApiStep1; // 공통 질문 데이터
  step2: ApiQuestion[]; // 개별 질문 리스트
  recruitMessage: string; // 모집 공고 메시지
};

export type ApiResponse = {
  resultType: "SUCCESS" | "FAIL";
  error: { errorCode?: string; reason?: string; data?: unknown } | string | null;
  success: ApiSuccess;
};

/** =========================
 *  프론트 상태 관리용 타입
 *  ========================= */

/** 프론트에서 공통 질문 상태로 쓰는 타입 */
export interface CommonAnswers {
  categoryId: number; // -1 = 미선택
  activityList: number[];
  styleList: number[];
  region: number; // -1 = 미선택
  age: number; // -1 = 미선택
  gender: number; // -1 = 미선택
}
/** 개별 질문 제출용 페이로드 */
export type AnswerPayload =
  | {
      questionId: number;
      type: typeof QUESTION_TYPE.CHECKBOX;
      values: string[];
    }
  | {
      questionId: number;
      type: typeof QUESTION_TYPE.LONG_TEXT;
      value: string;
    };

/** 최종 제출 API 페이로드 */
export type SubmitApplyPayload = {
  userId: number;
  step1: ApiStep1;
  step2: AnswerPayload[];
};

/** =========================
 *  변환 유틸 함수
 *  ========================= */

/** 프론트 CommonAnswers → 서버 ApiStep1 */
export const toApiStep1FromCommonAnswers = (c: CommonAnswers): ApiStep1 => ({
  category: c.categoryId,
  activities: c.activityList,
  styles: c.styleList,
  region: c.region,
  age: c.age,
  gender: c.gender ?? 0,
});

/** 서버 ApiStep1 → 프론트 CommonAnswers */
export const toCommonAnswersFromApiStep1 = (s: ApiStep1): CommonAnswers => ({
  categoryId: s.category,
  activityList: s.activities,
  styleList: s.styles,
  region: s.region,
  age: s.age,
  gender: s.gender,
});

// 서버에 보낼 answers 타입
export type ApplyAnswer =
  | { recruitFormId: number; checkedChoices: string[]; answer?: never }
  | { recruitFormId: number; answer: string | null; checkedChoices?: never };

// 서버에 보낼 최종 바디
export interface ApplyRequestBody {
  userId: number;
  activityList: number[];
  styleList: number[];
  region: 0 | 1; // 플래그
  age: 0 | 1; // 플래그
  gender: 0 | 1; // 플래그
  categoryId: 0 | 1; // 플래그
  answers: ApplyAnswer[];
}

//지원자 목록 서버응답 타입

// 서버 응답 원형(DTO)
export type ApplicantsDTO = {
  resultType: "SUCCESS" | "FAIL";
  error: { errorCode?: string; reason?: string; data?: unknown } | string | null;
  success: {
    applicants: {
      totalCount: number;
      applicants: Array<{
        applyId: number;
        nickname: string;
        profileImage: string | null;
        appliedAt: string; // ISO
        status: 0 | 1 | 2;
      }>;
    };
  };
};

export type ApplicantStatus = 0 | 1 | 2; // 0: 대기, 1: 승인, 2: 거절

export interface Applicant {
  applyid: number; // applyId
  nickname: string; // nickname
  appliedAt: string; // appliedAt
  ProfileImage?: string | null; // profileImage
  status: ApplicantStatus;
}

export interface ApplicantsResponse {
  applicants: Applicant[];
  totalCount: number;
  nextPage?: number; // 더 없으면 undefined
}

// 한 번에 전체 받아오는 구조 이고는 무한 렌더링을 위해!!
export interface ApplicantsAll {
  totalCount: number;
  all: Applicant[];
}

// 내가 지원한 크루 타입 정의
export type ApplyStatus = 0 | 1;
// 0: 미승인, 1: 승인,
export type AppliedItem = {
  applyId: number;
  crewId: number;
  crewName: string;
  crewImage: string | null;
  crewContent: string;
  status: ApplyStatus;
  statusLabel: string; // "미승인" 등 서버에서 내려준 라벨
  appliedAt: string; // ISO
};

export type AppliedListSuccess = {
  totalCount: number;
  items: AppliedItem[];
};

export type AppliedListResponse =
  | {
      resultType: "SUCCESS";
      error: null;
      success: AppliedListSuccess;
    }
  | {
      resultType: "FAIL";
      error: { errorCode: string; reason: string };
      success?: never;
    };
