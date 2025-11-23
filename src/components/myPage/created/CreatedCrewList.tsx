import InfiniteScroll from "react-infinite-scroll-component";
import { logger } from "../../utils/logger";
import CrewCard from "../CrewCard";
import { useCreatedCrews } from "../../../hooks/createdCrew/useCreatedCrew";
import noIcon from "../../../assets/icons/img_graphic3_340.svg";
export default function CreatedCrewList() {
  const { crews, loading, error, hasMore, fetchMoreData, totalCount } =
    useCreatedCrews();

  // 초기 로딩 상태 (첫 로딩일 때만)
  if (loading && crews.length === 0) {
    return <p className="text-center text-gray-400 mt-12">로딩 중...</p>;
  }

  // 에러 상태
  if (error) {
    return <p className="text-center text-red-400 mt-12">{error}</p>;
  }

  logger.debug("컴포넌트에서 확인:", { crews, loading, error, hasMore });
  logger.debug("crews 배열 길이:", crews?.length);

  //  빈 데이터 상태
  if (!crews || crews.length === 0) {
    return (
      <div className=" flex flex-col justify-center items-center">
        <img src={noIcon} className="h-[340px] w-[340px]" />
        <div className="text-center py-8 text-gray-500">
          회원님이 만든 크루가 없어요 <br />
          나만의 크루를 만들어 보세요!
        </div>
        <div className="text-center py-8 text-gray-500"></div>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={crews.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={
        <p className="text-center text-gray-400 py-4">더 불러오는 중...</p>
      }
      endMessage={
        <p className="text-center text-gray-400 py-4">
          모든 크루를 확인했습니다! (총 {totalCount}개)
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        {crews.map((crew) => {
          logger.debug("각 크루 확인:", crew);
          logger.debug("roleLabel 값:", crew.roleLabel);
          return (
            <CrewCard
              key={crew.id}
              crewId={crew.id}
              imageUrl={crew.imageUrl}
              category={crew.category}
              title={crew.name}
              description={crew.description}
              rightContent={
                <span
                  className={`
                    w-[7.5rem] h-[2.5rem]
                    flex items-center justify-center rounded-[1.25rem]
                    text-[1.25rem]
                    text-white
                    ${crew.roleLabel === "운영진" ? "bg-[#5E6068]" : "bg-[#3A3ADB]"}
                  `}
                >
                  {crew.roleLabel}
                </span>
              }
            />
          );
        })}
      </div>
    </InfiniteScroll>
  );
}
