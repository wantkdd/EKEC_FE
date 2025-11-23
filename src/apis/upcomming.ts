import { privateAPI } from "./httpClient";

// 타입 인터페이스 정의
interface Crew {
  crewId: number;
  crewName: string;
}

interface Plan {
  id: number;
  crew_name: string;
  title: string;
  day: string;
  daysUntil: number;
}

// 수정된 함수들 - 매개변수 타입 명시
export const fetchJoinedCrews = async (): Promise<Crew[]> => {
  const response = await privateAPI.get("crew/apply/joined");
  return response.data.success.items;
};

export const fetchCrewUpcomingPlans = async (
  crewId: number
): Promise<Plan[]> => {
  const response = await privateAPI.get(`crew/${crewId}/plan/upcoming`);
  return response.data.data.plans;
};

export const fetchAllUpcomingPlans = async (): Promise<Plan[]> => {
  const crews = await fetchJoinedCrews();

  // 구조분해할 때도 타입 명시
  const planPromises = crews.map(async ({ crewId, crewName }: Crew) => {
    const plans = await fetchCrewUpcomingPlans(crewId);
    return plans.map((plan) => ({
      ...plan,
      crew_name: crewName,
    }));
  });

  const allPlansArrays = await Promise.all(planPromises);
  const allPlans = allPlansArrays.flat();
  return allPlans.sort((a, b) => a.daysUntil - b.daysUntil);
};
