// src/pages/apply/ApplicationDetailPage.tsx
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/apply/Header";
import Info from "../../components/apply/Info";
import ApplyDetailReadonly from "../../components/apply/applyDetail/ApplyDetailStep1";
import ApplyStep2Readonly from "../../components/apply/applyDetail/ApplyDetailStep2";
import ApplyStepHeader from "../../components/apply/common/ApplyStepHeader";
import { ApproveBtn } from "../../components/apply/applyDetail/ApproveBtn";
import type { ApplyOption } from "../../types/apply/types";
import { useApplicationDetail } from "../../hooks/apply/useAppicationDetail";
import { mapSelectedValues } from "../../utils/apply/mapSelectedValues";
import { mapServerRegionsToOptions } from "../../utils/apply/mappingRegions";
import { showSuccess, showError } from "../../utils/toast";

export default function ApplicationDetailPage() {
  // 1) params -> 숫자 변환 (항상 호출)
  const { crewId: crewIdParam, applyId: applyIdParam } = useParams();
  const crewId = Number(crewIdParam);
  const applyId = Number(applyIdParam);
  const validIds = Number.isFinite(crewId) && Number.isFinite(applyId);

  // 2) 항상 훅 호출 (hook 내부 enabled로 네트워크 제어)
  const { detailQuery, initQuery } = useApplicationDetail(
    validIds ? crewId : (NaN as unknown as number), // 어차피 enabled로 막힘
    validIds ? applyId : (NaN as unknown as number)
  );
  const { data, isLoading, isError, error } = detailQuery;
  const { data: initData, isLoading: initLoading } = initQuery;

  // 3) 지역 옵션도 항상 useMemo로 계산 (조건부로 호출 금지)
  const regionOptions: ApplyOption[] = useMemo(
    () => mapServerRegionsToOptions(),
    []
  );

  // 4) 파생 데이터들은 안전하게 가드
  const rawStep1 =
    (initData as any)?.rawStep1 ?? (initData as any)?.success?.step1;
  const detailData = (data as any)?.success ?? data;

  const mapped = useMemo(() => {
    // 데이터 없으면 기본값으로
    if (!detailData || !rawStep1) {
      return {
        allowed: {
          categories: [],
          activities: [],
          styles: [],
          regions: [],
          ages: [],
          genders: [],
        },
        selected: {
          categoryId: 0,
          regionId: 0,
          ageId: 0,
          genderId: 0,
          activityIds: [],
          styleIds: [],
        },
      };
    }
    return mapSelectedValues(detailData, rawStep1);
  }, [detailData, rawStep1]);

  // 5) 하나의 return에서 조건 분기만 JSX로 처리
  return (
    <div className="px-40 py-5">
      <div className="mx-auto flex max-w-[56rem] flex-col gap-8">
        {/* 잘못된 경로 */}
        {!validIds && <div>잘못된 경로입니다.</div>}

        {/* 로딩 */}
        {validIds && (isLoading || initLoading) && <div>불러오는 중...</div>}

        {/* 에러 */}
        {validIds && (isError || (!data && !isLoading)) && (
          <div className="text-red-500">
            에러: {(error as Error)?.message || "불러오기 실패"}
          </div>
        )}

        {/* 정상 렌더 */}
        {validIds && !isLoading && data && (
          <>
            <Header crewId={crewId} />
            <Info crewId={crewId} />
            <section>
              <ApplyStepHeader
                step={1}
                title="본인에게 맞는 성향을 선택해주세요"
                required
              />
              <ApplyDetailReadonly
                allowedCategories={mapped.allowed.categories}
                allowedActivities={mapped.allowed.activities}
                allowedStyles={mapped.allowed.styles}
                allowedRegions={mapped.allowed.regions}
                allowedAges={mapped.allowed.ages}
                allowedGenders={mapped.allowed.genders}
                selected={mapped.selected}
                regionOptions={regionOptions}
              />
            </section>

            <section>
              <ApplyStepHeader
                step={2}
                title="지원자를 운영진에게 소개해주세요"
                required
              />
              <ApplyStep2Readonly
                questions={
                  (initData as any)?.success?.step2 ??
                  (initData as any)?.step2 ??
                  []
                }
                detail={detailData}
              />
            </section>

            <ApproveBtn
              crewId={crewId}
              applyId={applyId}
              onSuccess={() => showSuccess("처리 완료!")}
              onError={(msg) => showError(msg)}
            />
          </>
        )}
      </div>
    </div>
  );
}
