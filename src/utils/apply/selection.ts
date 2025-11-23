// src/utils/apply/selection.ts

/** 단일 선택 해석 (전부 number라는 전제) */
export const resolveSingle = ({
  idCandidate,
  flag,
  rawId,
  allowed,
}: {
  idCandidate?: number; // 상세 응답의 'ID' 후보
  flag?: number; // 상세 응답의 '플래그(0/1)'
  rawId?: number; // 허용 원본의 실제 매핑 ID
  allowed: number[]; // 허용 목록
}) => {
  if (idCandidate && allowed.includes(idCandidate)) return idCandidate;
  if (flag === 1 && rawId) return rawId;
  return 0;
};

/** 카테고리만 네이밍이 엇갈릴 수 있어 Primary → Fallback으로 이중 해석 */
export const resolveCategoryId = ({
  detail,
  rawCategory,
  allowedCategories,
}: {
  detail: Record<string, unknown>;
  rawCategory?: number;
  allowedCategories: number[];
}) => {
  const primary = resolveSingle({
    idCandidate: detail?.categoryId as number | undefined,
    flag: detail?.category as number | undefined,
    rawId: rawCategory,
    allowed: allowedCategories,
  });
  if (primary) return primary;

  const fallback = resolveSingle({
    idCandidate: detail?.category as number | undefined,
    flag: detail?.categoryId as number | undefined,
    rawId: rawCategory,
    allowed: allowedCategories,
  });
  return fallback;
};
