import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { API } from '../../apis/httpClient';
import type { Crew } from "../../types/crewCreate/crew";
import { getRegionId } from "../../utils/regions";

type Resp = { crews: Crew[]; count: number };

// 배열 → 서버 쿼리 형태로 변환
function toQuery(p: {
  name?: string;
  category?: number[];
  activity?: number[];
  style?: number[];
  regionSido?: string;
  regionGu?: string;
  regionIds?: number[];
  age?: number | null;
  gender?: number | null;
  capacity?: number | null;
  page: number;
  sort: number;
}) {
  const q: Record<string, string> = {
    page: String(p.page),
    sort: String(p.sort),
  };
  if (p.name?.trim()) q.name = p.name.trim();
  if (p.category?.length) q.category = p.category.join(",");
  if (p.activity?.length) q.activity = p.activity.join(",");
  if (p.style?.length) q.style = p.style.join(",");
  if (p.regionIds?.length) {
    q.region = p.regionIds.join(",");
  } else if (p.regionSido || p.regionGu) {
    const rid = getRegionId(p.regionSido ?? null, p.regionGu ?? null);
    if (rid != null) q.region = String(rid);
  }
  if (p.age != null) q.age = String(p.age);
  if (p.gender != null) q.gender = String(p.gender);
  if (p.capacity != null) q.capacity = String(p.capacity);
  return q;
}

export function useCrewSearchDetail(params: {
  name?: string;
  category?: number[];
  activity?: number[];
  style?: number[];
  regionSido?: string;
  regionGu?: string;
  regionIds?: number[];
  age?: number | null;
  gender?: number | null;
  capacity?: number | null;
  page: number;
  sort: number;
}) {
  const regionKey = params.regionIds?.length
    ? params.regionIds.join(",")
    : (getRegionId(params.regionSido ?? null, params.regionGu ?? null) ?? null);

  const key = {
    page: String(params.page),
    sort: String(params.sort),
    name: params.name?.trim() || "",
    category: (params.category ?? []).join(","),
    activity: (params.activity ?? []).join(","),
    style: (params.style ?? []).join(","),
    region: regionKey != null ? String(regionKey) : "",
    age: params.age != null ? String(params.age) : "",
    gender: params.gender != null ? String(params.gender) : "",
    capacity: params.capacity != null ? String(params.capacity) : "",
  };

  return useQuery<Resp, Error>({
    queryKey: ["crewSearchDetail", key],
    queryFn: ({ signal }) =>
      API.get("/crew/search/detail", {
        params: toQuery(params),
        signal,
      }).then((r) => r.data.data as Resp),
    placeholderData: keepPreviousData,
  });
}
