import { resolveSingle, resolveCategoryId } from "./selection";

export const mapSelectedValues = (detail: unknown, raw: unknown) => {
  const d = (detail && typeof detail === 'object' ? detail : {}) as Record<string, unknown>;
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const allowedCategories: number[] = r.category ? [r.category as number] : [];
  const allowedRegions: number[] = r.region ? [r.region as number] : [];
  const allowedAges: number[] = r.age ? [r.age as number] : [];
  const allowedGenders: number[] = r.gender === 0 ? [] : [(r.gender as number) ?? 0];
  const allowedActivities: number[] = Array.isArray(r.activities)
    ? r.activities
    : [];
  const allowedStyles: number[] = Array.isArray(r.styles) ? r.styles : [];

  const selected = {
    categoryId: resolveCategoryId({
      detail: d,
      rawCategory: r.category as number | undefined,
      allowedCategories,
    }),
    regionId: resolveSingle({
      idCandidate: d.regionId as number | undefined,
      flag: d.region as number | undefined,
      rawId: r.region as number | undefined,
      allowed: allowedRegions,
    }),
    ageId: resolveSingle({
      idCandidate: d.ageId as number | undefined,
      flag: d.age as number | undefined,
      rawId: r.age as number | undefined,
      allowed: allowedAges,
    }),
    genderId: resolveSingle({
      idCandidate: d.genderId as number | undefined,
      flag: d.gender as number | undefined,
      rawId: r.gender as number | undefined,
      allowed: allowedGenders.length ? allowedGenders : [0, 1, 2],
    }),
    activityIds:
      (Array.isArray(d.activityList) && d.activityList) ||
      (Array.isArray(d.activities) && d.activities) ||
      [],
    styleIds:
      (Array.isArray(d.styleList) && d.styleList) ||
      (Array.isArray(d.styles) && d.styles) ||
      [],
  };

  return {
    allowed: {
      categories: allowedCategories,
      regions: allowedRegions,
      ages: allowedAges,
      genders: allowedGenders,
      activities: allowedActivities,
      styles: allowedStyles,
    },
    selected,
  };
};
