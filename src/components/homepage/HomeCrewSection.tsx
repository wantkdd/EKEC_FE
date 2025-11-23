import { useState } from "react";
import CrewCard from "./CrewCard";
import type { Crew } from "./CrewCard";
import CrewSelector from "./CrewSelector";
import { useNavigate } from "react-router-dom";
import HomeCrewSectionSkeleton from "./HomeCrewSectionSkeleton";
import { useQuery } from "@tanstack/react-query";
import { API } from '../../apis/httpClient';
import { buildFreshQS } from "../../utils/crewFilter/buildCrewListQs";

export default function HomeCrewSection() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"popular" | "new">("popular");

  const { data, isLoading } = useQuery({
    queryKey: ["crew", selectedTab], //  탭에 따라 queryKey 변경
    queryFn: async () => {
      const endpoint =
        selectedTab === "popular" ? "/crew/list/popular" : "/crew/list/latest";

      const res = await API.get(endpoint);
      return res.data.success.crews;
    },
  });

  console.log("isLoading:", isLoading, "data:", data);

  if (isLoading) return <HomeCrewSectionSkeleton />;

  const crewList = data || [];

  const mappedCrews: Crew[] = crewList.map((crew: any) => {
    const imageUrl = crew.bannerImage
      ? `${import.meta.env.VITE_API_BASE_URL}/image/?type=0&fileName=${crew.bannerImage}`
      : "";

    return {
      id: crew.id,
      name: crew.title,
      content: crew.content || "소개글이 없습니다.",
      category: crew.crewCategory,
      tags: [...crew.crewStyle, ...crew.crewActivity],
      imageUrl: imageUrl,
    };
  });

  console.log("최종 mappedCrews:", mappedCrews);

  // 탭에 따라 라벨/정렬
  const isPopular = selectedTab === "popular";
  const moreLabel = isPopular ? "인기 크루 더보기" : "신규 크루 더보기";
  const handleMore = () => {
    const qs = buildFreshQS({
      page: 1,
      sort: isPopular ? 2 : 1,
    });
    navigate(`/crewListPage?${qs}`);
  };

  return (
    <section>
      <div className="w-full max-w-[940px] mx-auto mt-12">
        <div className="flex justify-center mb-6">
          <CrewSelector selected={selectedTab} onChange={setSelectedTab} />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {mappedCrews.slice(0, 20).map((crew) => (
            <CrewCard key={crew.id} crew={crew} />
          ))}
        </div>
      </div>
      <button
        onClick={handleMore}
        className="block w-full text-center my-8 py-3 rounded-xl bg-[#F1F1F5] text-[#555] font-semibold cursor-pointer"
      >
        {moreLabel}
      </button>
    </section>
  );
}
