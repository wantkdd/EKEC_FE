// src/utils/apply/mapStep2.ts
import { QUESTION_TYPE, type ApiQuestion } from "../../types/apply/types";

/** detail 응답 answer 아이템(최소 형태) */
type AnswerItem = {
  recruitFormId?: number;
  questionId?: number;
  questionType?: number;
  checkedChoices?: string[] | null;
  etcChoices?: string[] | null; // 서버 예시 대응
  answer?: string | null;
  etcText?: string | null; // 백 변동 대비
};

/** 화면용 아이템 */
export type QAViewItem =
  | {
      id: number;
      question: string;
      required: boolean;
      type: "CHECKBOX";
      values: string[]; // 선택 라벨들
      etcText?: string | null; // 기타 textarea에 채울 값(여러 개면 줄바꿈)
    }
  | {
      id: number;
      question: string;
      required: boolean;
      type: "LONG_TEXT";
      value: string | null; // 장문 답변
    };

/** detail 응답에서 answers 배열 꺼내기(키 명이 달라도 커버) */
const extractAnswers = (detail: unknown): AnswerItem[] => {
  if (!detail || typeof detail !== 'object') return [];
  const d = detail as Record<string, unknown>;
  return (Array.isArray(d.answers) && d.answers) ||
    (Array.isArray(d.step2Answers) && d.step2Answers) ||
    [];
};

/** 답변에서 해당 질문 id와 매칭 (서버가 recruitFormId 또는 questionId를 쓸 수 있음) */
const findAnswerByQuestionId = (answers: AnswerItem[], qid: number) =>
  answers.find((a) => a?.recruitFormId === qid || a?.questionId === qid);

/** 문자열 배열 정리: null/공백 제거 + 중복 제거 */
const cleanStrArray = (
  arr?: (string | null | undefined)[] | null
): string[] => {
  if (!Array.isArray(arr)) return [];
  const set = new Set<string>();
  for (const x of arr) {
    const v = (x ?? "").trim();
    if (v) set.add(v);
  }
  return [...set];
};

/** textarea에 넣기 좋게 etc를 문자열로 합침(여러 개면 줄바꿈) */
const toEtcText = (ans?: AnswerItem): string | null => {
  if (!ans) return null;
  const etcFromArray = cleanStrArray(ans.etcChoices);
  const fallbackSingles = cleanStrArray([
    typeof ans.answer === "string" ? ans.answer : null,
    typeof ans.etcText === "string" ? ans.etcText : null,
  ]);
  const all = [...etcFromArray, ...fallbackSingles];
  if (all.length === 0) return null;
  return all.join("\n");
};

/** 최종 매핑 */
export const mapStep2ToView = (
  questions: ApiQuestion[] = [],
  detail: unknown
): QAViewItem[] => {
  const answers = extractAnswers(detail);

  return questions.map((q) => {
    const ans = findAnswerByQuestionId(answers, q.id);
    const required = q.required === 1;

    if (q.questionType === QUESTION_TYPE.CHECKBOX) {
      const values = cleanStrArray(ans?.checkedChoices);
      const etcText = q.isEtc === 1 ? toEtcText(ans) : null;

      return {
        id: q.id,
        question: q.question,
        required,
        type: "CHECKBOX" as const,
        values, // 체크된 것처럼 표시
        etcText, // 기타 체크 + textarea 값
      };
    }

    // LONG_TEXT
    return {
      id: q.id,
      question: q.question,
      required,
      type: "LONG_TEXT" as const,
      value: typeof ans?.answer === "string" ? ans.answer : null,
    };
  });
};
