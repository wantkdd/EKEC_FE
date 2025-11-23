import { useEffect, useState, useCallback } from "react";
import type { CreatedCrew } from "../../types/mypage/CreateCrew";
import { privateAPI } from '../../apis/httpClient';
import { logger } from "../../utils/logger";

interface CrewApiResponse {
  crewId: number;
  crewName: string;
  crewContent: string;
  crewImage: string | null;
  categoryId: number;
  categoryName: string;
  crewCreatedAt: string;
  role: number;
  roleLabel: string;
}

const ITEMS_PER_PAGE = 5; // 한 번에 보여줄 개수

export function useCreatedCrews() {
  const [allCrews, setAllCrews] = useState<CreatedCrew[]>([]); // 전체 데이터 저장
  const [displayedCrews, setDisplayedCrews] = useState<CreatedCrew[]>([]); // 화면에 표시할 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchCrews() {
      try {
        setLoading(true);
        const response = await privateAPI.get("/crew/create/list");

        logger.debug("API 응답", { data: response.data });
        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.success.items)
        ) {
          const mappedCrews = response.data.success.items.map(
            (item: CrewApiResponse) => ({
              id: item.crewId,
              name: item.crewName,
              description: item.crewContent,
              imageUrl: item.crewImage
                ? `https://api.ekec.site/api/image/?type=0&fileName=${item.crewImage}`
                : null,
              category: item.categoryName,
              roleLabel: item.roleLabel,
            })
          );

          logger.debug("매핑된 크루들", { mappedCrews });

          // 전체 데이터 저장
          setAllCrews(mappedCrews);

          // 처음 ITEMS_PER_PAGE개만 화면에 표시
          setDisplayedCrews(mappedCrews.slice(0, ITEMS_PER_PAGE));
          setCurrentIndex(ITEMS_PER_PAGE);
          setHasMore(mappedCrews.length > ITEMS_PER_PAGE);
        } else {
          setAllCrews([]);
          setDisplayedCrews([]);
        }

        setError(null);
      } catch (err) {
        logger.error("크루 데이터 조회 실패", err);
        setError("크루 데이터를 불러오는데 실패했습니다.");
        setAllCrews([]);
        setDisplayedCrews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCrews();
  }, []);

  // 더 많은 데이터 로드하는 함수
  const fetchMoreData = useCallback(() => {
    if (currentIndex >= allCrews.length) {
      setHasMore(false);
      return;
    }

    // 약간의 로딩 딜레이 효과
    setTimeout(() => {
      const nextItems = allCrews.slice(
        currentIndex,
        currentIndex + ITEMS_PER_PAGE
      );
      setDisplayedCrews((prev) => [...prev, ...nextItems]);
      setCurrentIndex((prev) => prev + ITEMS_PER_PAGE);

      // 더 불러올 데이터가 있는지 확인
      if (currentIndex + ITEMS_PER_PAGE >= allCrews.length) {
        setHasMore(false);
      }
    }, 300);
  }, [allCrews, currentIndex]);

  logger.debug("훅에서 반환", {
    crews: displayedCrews,
    loading,
    error,
    hasMore,
    totalCount: allCrews.length,
  });

  return {
    crews: displayedCrews, //  displayedCrews를 반환
    loading,
    error,
    hasMore,
    fetchMoreData,
    totalCount: allCrews.length,
  };
}
