// src/components/apply/ApplicationForm.tsx
import { useMemo, useState } from "react";
import ApplyStepHeader from "./common/ApplyStepHeader";
import ApplySubmitBar from "./ApplySubmitBar";
import CommonQuestionFlagsOnly from "./applyStep1/ApplyStep1";

import type {
  ApiStep1,
  ApiQuestion,
  CommonAnswers,
  ApplyRequestBody,
  ApplyAnswer,
} from "../../types/apply/types";
import { toApiStep1FromCommonAnswers } from "../../types/apply/types";
import { useApplySubmit } from "../../hooks/apply/useApply";
import ApplyModal from "./ApplyModal";
import { useNavigate } from "react-router-dom";
import CustomQuestionsForm from "./applyStep2/ApplyStep2Form";
import { useApplyInit } from "../../hooks/apply/useCustomQusetion";

// ⬇️ 추가: 지역 옵션 변환 유틸
import { mapServerRegionsToOptions } from "../../utils/apply/mappingRegions";
import { showError } from "../../utils/toast";

type SelectedFlags = {
  category: 0 | 1;
  region: 0 | 1;
  age: 0 | 1;
  gender: 0 | 1;
};

export default function ApplicationForm({
  crewId,
  userId,
  onChangeAnswers,
}: {
  crewId: number;
  userId: number;
  onSubmit: (body: ApplyRequestBody) => Promise<void> | void; // 외부에서 쓰면 남겨두기
  onChangeAnswers?: (answers: ApplyAnswer[]) => void;
  submitLabel?: string;
  showDebug?: boolean;
}) {
  const { mutateAsync, isPending } = useApplySubmit();
  const [showComplete, setShowComplete] = useState(false);
  const navigate = useNavigate();

  // 1) 초기 데이터 로드
  const { data, isLoading, isError, error } = useApplyInit(crewId);

  // 2) step1 추출
  const defaultStep1: ApiStep1 = useMemo(
    () => ({
      gender: 0,
      styles: [],
      activities: [],
      region: 0,
      category: 0,
      age: 0,
    }),
    []
  );

  const step1: ApiStep1 = useMemo(() => {
    const fromSuccess = (data as any)?.success?.step1 as ApiStep1 | undefined;
    if (fromSuccess) return fromSuccess;
    const raw = (data as any)?.rawStep1 as ApiStep1 | undefined;
    if (raw) return raw;
    const front = (data as any)?.step1 as CommonAnswers | undefined;
    if (front) return toApiStep1FromCommonAnswers(front);
    return defaultStep1;
  }, [data, defaultStep1]);

  // step2 질문
  const questions: ApiQuestion[] = useMemo(() => {
    const fromSuccess = (data as any)?.success?.step2 as
      | ApiQuestion[]
      | undefined;
    if (fromSuccess) return fromSuccess;
    return ((data as any)?.step2 as ApiQuestion[]) ?? [];
  }, [data]);

  // 3) STEP1 상태 (플래그 & 리스트)
  const [flags, setFlags] = useState<SelectedFlags>({
    category: 0,
    region: 0,
    age: 0,
    gender: 0,
  });
  const [activityList, setActivityList] = useState<number[]>([]);
  const [styleList, setStyleList] = useState<number[]>([]);

  // 4) STEP2 상태
  const [answers, setAnswers] = useState<ApplyAnswer[]>([]);
  const [valid, setValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  // 제한 값 (ID 목록)
  const allowedCategories = useMemo(
    () => (step1.category ? [step1.category] : []),
    [step1.category]
  );
  const allowedRegions = useMemo(
    () => (step1.region ? [step1.region] : []),
    [step1.region]
  );
  const allowedAges = useMemo(
    () => (step1.age ? [step1.age] : []),
    [step1.age]
  );
  const allowedGenders = useMemo(
    () => (step1.gender === 0 ? [] : [step1.gender]),
    [step1.gender]
  );
  const allowedActivities = useMemo(
    () => step1.activities ?? [],
    [step1.activities]
  );
  const allowedStyles = useMemo(() => step1.styles ?? [], [step1.styles]);

  // UI에서 선택된(혹은 기본 고정된) step1 ID 맵
  const step1Map = useMemo(
    () => ({
      category: step1.category || undefined,
      region: step1.region || undefined,
      age: step1.age || undefined,
      gender: step1.gender || undefined,
    }),
    [step1.category, step1.region, step1.age, step1.gender]
  );

  // 지역 옵션 리스트 (라벨/값)
  const regionOptions = useMemo(() => mapServerRegionsToOptions(), []);

  // 제출 바디(플래그 전송) - 서버가 플래그 받음!
  const buildStep1Flags = () => ({
    activityList,
    styleList,
    categoryFlag: flags.category,
    regionFlag: flags.region,
    ageFlag: flags.age,
    genderFlag: step1.gender === 0 ? 0 : flags.gender, // 성별 무관(0)이면 항상 0 전송
  });

  return (
    <div className="flex flex-col gap-8">
      {/* STEP 1 */}
      <section>
        <ApplyStepHeader
          step={1}
          title="성향 중 본인에게 맞는 성향을 선택해주세요"
          required
        />
        <CommonQuestionFlagsOnly
          step1Map={step1Map}
          regionOptions={regionOptions} // ✅ 옵션 리스트 전달
          allowedCategories={allowedCategories}
          allowedActivities={allowedActivities}
          allowedStyles={allowedStyles}
          allowedRegions={allowedRegions} // ✅ 허용 ID 목록
          allowedAges={allowedAges}
          allowedGenders={allowedGenders}
          selected={flags}
          onChangeSelected={setFlags}
          onChange={(common) => {
            setActivityList(common.activityList ?? []);
            setStyleList(common.styleList ?? []);
          }}
        />
      </section>

      {/* STEP 2 */}
      <section>
        <ApplyStepHeader
          step={2}
          title="크루장이 준비한 질문에 답해주세요"
          required
        />
        <CustomQuestionsForm
          questions={questions}
          onChange={(a) => {
            setAnswers(a);
            onChangeAnswers?.(a as ApplyAnswer[]);
          }}
          onValidateChange={(ok, message) => {
            setValid(ok);
            setErrorMsg(message);
          }}
        />
        {!valid && errorMsg && (
          <div className="mt-2 text-sm text-[#FF4949]">{errorMsg}</div>
        )}
      </section>

      {/* SUBMIT BAR */}
      <ApplySubmitBar
        disabled={
          isLoading || isPending || !valid || !userId || questions.length === 0
        }
        onSubmit={async () => {
          const s1 = buildStep1Flags();
          const body: ApplyRequestBody = {
            userId,
            activityList: s1.activityList,
            styleList: s1.styleList,
            region: s1.regionFlag,
            age: s1.ageFlag,
            gender: s1.genderFlag,
            categoryId: s1.categoryFlag,
            answers,
          };

          try {
            await mutateAsync({ crewId, body });
            setShowComplete(true); // 성공 모달
          } catch (err: any) {
            const msg =
              err?.response?.data?.message ||
              "지원에 실패했습니다. 잠시 후 다시 시도해주세요.";
            showError(msg);
          }
        }}
      />

      {showComplete && (
        <ApplyModal
          onClose={() => {
            setShowComplete(false);
            navigate(`/crew/${crewId}`);
          }}
        />
      )}

      {/* 로딩/에러 */}
      {isLoading && <div>불러오는 중...</div>}
      {isError && (
        <div className="text-red-500">에러: {(error as Error)?.message}</div>
      )}
    </div>
  );
}
