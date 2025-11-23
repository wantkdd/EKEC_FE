import { API } from "./httpClient";
// 자동완성 api

type Crew = { name: string };

type CrewNameApiResponse = {
  success?: { crews?: Crew[] };
  data?: { crews?: Crew[] };
};

export async function fetchCrewNameSuggestions(
  q: string,
  signal?: AbortSignal,
  limit = 5
): Promise<string[]> {
  const name = q.trim();
  if (!name) return [];

  const { data } = await API.get<CrewNameApiResponse>("/crew/search/name", {
    params: {
      name,
      page: 1,
      sort: 2,
    },
    signal,
  });

  const crews = data?.success?.crews ?? data?.data?.crews ?? [];
  const names = Array.from(new Set((crews ?? []).map((c) => String(c.name))));
  return names.slice(0, limit);
}
