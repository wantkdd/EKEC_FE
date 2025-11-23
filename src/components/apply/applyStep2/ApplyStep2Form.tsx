// src/components/apply/CustomQuestionsForm.tsx
import { useEffect, useMemo, useRef } from "react";
import { logger } from "../../utils/logger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ 타입/상수는 types에서
import { QUESTION_TYPE, type ApiQuestion } from "../../../types/apply/types";

// ✅ 스키마/기본값/폼타입/페이로드는 schemas에서
import {
  makeStep2Schema,
  makeStep2Defaults,
  toStep2Payload,
  type Step2FormValues,
} from "../../../schemas/apply/Step2";
import CustomQuestionItem from "../applyStep2/ApplyStep2Item";

// ✅ crewCreate/QuestionItem ❌ → step2/CustomQuestionItem ✅

// 부모로 넘길 제출 타입
type SubmitAnswer =
  | { recruitFormId: number; checkedChoices: string[]; answer?: never }
  | { recruitFormId: number; answer: string; checkedChoices?: never };

type Props = {
  questions: ApiQuestion[]; // 서버에서 받은 질문 목록
  onChange: (answers: SubmitAnswer[]) => void; // 값이 바뀔 때마다 호출
  onValidateChange?: (ok: boolean, message?: string) => void; // 유효성 결과 변경 시 호출
  disabled?: boolean; // ✅ 읽기 전용 모드
  value?: SubmitAnswer[]; // ✅ 외부에서 답변 주입 (조회용)
};

export default function CustomQuestionsForm({
  questions,
  onChange,
  onValidateChange,
  disabled = false,
  value,
}: Props) {
  // 1) 스키마/기본값
  const schema = useMemo(() => makeStep2Schema(questions), [questions]);
  const defaults = useMemo(() => makeStep2Defaults(questions), [questions]);

  // 2) RHF
  const {
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: defaults,
  });

  // 질문 세트 변경 시 리셋
  useEffect(() => {
    reset(defaults, { keepDirty: false, keepTouched: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // (옵션) 외부 주입값 → RHF로 반영
  useEffect(() => {
    if (!value || value.length === 0) return;
    const next = { ...defaults };
    for (const ans of value) {
      const key = String(ans.recruitFormId);
      if ("checkedChoices" in ans) {
        next[key] = {
          type: QUESTION_TYPE.CHECKBOX,
          values: ans.checkedChoices ?? [],
          // etc는 외부 주입 스펙 없으면 생략
        };
      } else {
        next[key] = {
          type: QUESTION_TYPE.LONG_TEXT,
          value: ans.answer ?? "",
        };
      }
    }
    reset(next, { keepDirty: false, keepTouched: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // 3) 변경 감지 → 부모로 전달
  const values = watch();
  const lastPayloadRef = useRef("");
  const lastValidRef = useRef<boolean | null>(null);
  const lastMsgRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const payload = toStep2Payload(questions, values) as SubmitAnswer[];
    const payloadStr = JSON.stringify(payload);

    if (payloadStr !== lastPayloadRef.current) {
      lastPayloadRef.current = payloadStr;
      onChange(payload);
    }

    const firstMsg = getFirstErrorMessage(errors as any);
    if (isValid !== lastValidRef.current || firstMsg !== lastMsgRef.current) {
      lastValidRef.current = isValid;
      lastMsgRef.current = firstMsg;
      onValidateChange?.(isValid, firstMsg);
    }
  }, [values, errors, isValid, questions, onChange, onValidateChange]);

  // 4) 옵션 추출
  const getOptions = (q: ApiQuestion): string[] => {
    const raw = (q?.choiceList as any)?.list;
    return Array.isArray(raw) ? raw.map((s) => String(s)) : [];
  };

  // 5) 렌더
  return (
    <div
      className={`space-y-6 ${disabled ? "pointer-events-none opacity-95" : ""}`}
    >
      {questions.map((q, index) => {
        const key = String(q.id);
        const opts = getOptions(q);
        const cur = values[key] as any;

        const selectedForItem =
          q.questionType === QUESTION_TYPE.CHECKBOX
            ? (cur?.values ?? [])
            : (cur?.value ?? "");

        const allowEtc =
          q.questionType === QUESTION_TYPE.CHECKBOX && q.isEtc === 1;

        const err = (errors as any)[key];

        const handleCheckboxChange = (next: string[]) => {
          if (disabled) return;
          setValue(
            key,
            {
              ...(cur ?? { type: QUESTION_TYPE.CHECKBOX, values: [] }),
              values: next,
            },
            { shouldValidate: true, shouldDirty: true }
          );
        };
        const handleEtcChange = (text: string) => {
          logger.debug("🔵 handleEtcChange 호출:", {
            text,
            key,
            currentValues: cur?.values,
            currentEtc: cur?.etc,
          });
          if (disabled || !allowEtc) return;

          setValue(
            key,
            {
              ...(cur ?? { type: QUESTION_TYPE.CHECKBOX, values: [] }),
              etc: text,
            },
            { shouldValidate: true, shouldDirty: true }
          );
        };

        const handleTextInput = (text: string) => {
          if (disabled) return;
          setValue(
            key,
            { type: QUESTION_TYPE.LONG_TEXT, value: text },
            { shouldValidate: true, shouldDirty: true }
          );
        };

        return (
          <div key={q.id} className="space-y-2">
            <CustomQuestionItem
              order={index + 1}
              q={q}
              options={opts}
              selected={selectedForItem}
              etcText={cur?.etc ?? ""}
              onCheckboxChange={handleCheckboxChange}
              onEtcTextChange={handleEtcChange}
              onTextInput={handleTextInput}
            />

            {err && (
              <div className="mt-1 text-sm text-red-600">
                {err.values?.message || err.value?.message || err.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* 에러 메시지 추출 */
function getFirstErrorMessage(
  errors: Record<string, any> | undefined
): string | undefined {
  if (!errors) return undefined;
  for (const key of Object.keys(errors)) {
    const e = errors[key];
    const m = e?.values?.message || e?.value?.message || e?.message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return undefined;
}
