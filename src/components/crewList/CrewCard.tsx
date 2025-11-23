import type { Crew } from "../../types/crewCreate/crew";
import starIcon from "../../assets/icons/ic_Star_36.svg";
import defaultBanner from "../../assets/logo/img_crew_banner.svg";
import { useNavigate } from "react-router-dom";

const CrewCard = ({
  id,
  name,
  description,
  capacity,
  memberCount,
  score,
  bannerImage,
  crewCategory,
  crewActivity,
  crewStyle,
}: Crew) => {
  const navigate = useNavigate();

  const bannerSrc =
    bannerImage && bannerImage.trim()
      ? bannerImage.startsWith("http")
        ? bannerImage
        : `${import.meta.env.VITE_API_BASE_URL}/image/?type=0&fileName=${encodeURIComponent(bannerImage)}`
      : defaultBanner;

  const goDetail = () => navigate(`/crew/${id}`);
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail();
    }
  };

  return (
    <div
      onClick={goDetail}
      onKeyDown={onKey}
      role="button"
      tabIndex={0}
      aria-label={`${name} 크루 상세 페이지로 이동`}
      className="flex items-center w-full max-w-[1320px] h-auto bg-white rounded-xl border-2 border-[#D9DADD] p-4 hover:-translate-y-0.5 duration-300 hover:shadow-xl cursor-pointer"
    >
      {/* 배너 이미지 */}
      <div className="relative w-1/3 aspect-[3/2] rounded-lg overflow-hidden min-w-[280px] max-w-[360px]">
        <img
          src={bannerSrc}
          alt={`${name} 크루 배너 이미지`}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== defaultBanner) {
              img.onerror = null;
              img.src = defaultBanner;
            }
          }}
          className="w-full h-full object-cover"
        />

        {/* 카테고리 태그 */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-block bg-[linear-gradient(135deg,#3A3ADB_0%,#3A3ADB_30%,#63BCEC_70%,#72EDF2_100%)] text-white text-xs sm:text-sm md:text-md lg:text-lg font-medium px-3 h-7 rounded-full whitespace-nowrap"
            aria-label={`카테고리: ${crewCategory}`}
          >
            {crewCategory}
          </span>
        </div>
      </div>

      {/* 오른쪽 내용 */}
      <div className="flex flex-col justify-between flex-1 pl-6 py-1 gap-1">
        {/* 크루명, 소개 */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold pb-2">
            {name}
          </h3>
          <p className="text-base sm:text-lg md:text-xl font-medium text-[#5E6068] mt-1">
            {description}
          </p>
        </div>

        {/* 인원, 별점 */}
        <div className="flex items-center gap-4 mt-2">
          <span
            className={`flex items-center text-sm sm:text-base md:text-xl font-normal text-white h-10 px-3 rounded-full ${
              memberCount === capacity ? "bg-[#5E6068]" : "bg-[#3A3ADB]"
            }`}
          >
            크루 {memberCount ?? 0}/
            {capacity == null || capacity === 0 ? "00" : capacity}
          </span>
          <span className="text-sm sm:text-base md:text-xl font-normal text-[#1A1B1E] flex items-center gap-2">
            <img src={starIcon} alt="" aria-hidden="true" />
            <span aria-label={`별점: ${typeof score === "number" ? score.toFixed(1) : "0.0"}점`}>
              {typeof score === "number" ? score.toFixed(1) : "0.0"}
            </span>
          </span>
        </div>

        {/* 활동 태그 */}
        <div className="flex flex-wrap gap-x-2 gap-y-1.5 mt-3">
          {crewActivity.map((tag, i) => (
            <span
              key={`activity-${i}`}
              className="bg-[#F7F7FB] text-[#5E6068] text-sm sm:text-base md:text-lg font-normal h-[29px] px-3 rounded-md flex items-center"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 스타일 태그 */}
        <div className="flex flex-wrap gap-x-2 gap-y-1.5 mt-1">
          {crewStyle.map((tag, i) => (
            <span
              key={`style-${i}`}
              className="bg-[#F7F7FB] text-[#5E6068] text-sm sm:text-base md:text-lg font-normal h-[29px] px-3 rounded-md flex items-center"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrewCard;
