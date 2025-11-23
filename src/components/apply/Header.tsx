import CategoryBgImgs from "../CategoryBgImgs";
import { logger } from "../../utils/logger";
import logo from "../../assets/logo/ic_logo graphic_45.svg";
import { useCrewInfo } from "../../hooks/apply/useCrewInfo";

interface Props {
  crewId: number;
}

const Header = ({ crewId }: Props) => {
  // 구조분해할당으로 수정
  const tabs = ["소개", "공지", "일정", "리뷰", "게시판"];
  const { crewInfo, loading, error } = useCrewInfo(crewId);

  // 디버깅용 콘솔 로그
  logger.debug("Header - crewId:", crewId);
  logger.debug("Header - crewInfo:", crewInfo);
  logger.debug("Header - loading:", loading);
  logger.debug("Header - error:", error);

  // 로딩/에러 상태 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!crewInfo) return <div>크루 정보를 찾을 수 없습니다.</div>;

  // 베너 이미지 추출
  const bannerImage = crewInfo.bannerImage
    ? `${import.meta.env.VITE_API_BASE_URL}/image/?type=0&fileName=${crewInfo.bannerImage}`
    : "";

  return (
    <div className="flex flex-col w-full">
      {/* 상단 프로필 영역 */}
      <div className="flex items-center gap-[1rem] py-[1rem]">
        {/* 프로필 이미지 */}
        <div className="w-[5rem] h-[5rem] bg-[#ECECFC] rounded-full flex items-center justify-center">
          {crewInfo.bannerImage ? (
            <img
              src={bannerImage}
              className="w-full h-full rounded-full object-cover"
              alt="크루 베너"
            />
          ) : (
            <img
              src={logo}
              className="w-[1.625rem] h-[1.625rem]"
              alt="기본 로고"
            />
          )}
        </div>
        {/* 크루명 - API에서 받아온 데이터 사용 */}
        <div className="text-[2.5rem] font-bold">{crewInfo.title}</div>
        {/* 카테고리 배경 아이콘 - API에서 받아온 카테고리 사용 */}
        <CategoryBgImgs category={crewInfo.category} />
      </div>

      {/* 하단 탭 영역 */}
      <div className="border-b-[0.3125rem] border-[#D9D9D9]">
        <div className="flex justify-evenly items-center gap-[5rem] h-[3rem]">
          {tabs.map((tab) => (
            <div key={tab} className="text-center text-[1.5rem] text-[#93959D]">
              {tab}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
