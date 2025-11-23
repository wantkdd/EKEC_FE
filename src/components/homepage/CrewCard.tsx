import bennerLogo from "../../assets/logo/img_crew_banner.svg";
import { logger } from "../../utils/logger";
import { useNavigate } from "react-router-dom";
import CategoryBgImgs from "../CategoryBgImgs"; // CategoryBgImgs 가져오기

export interface Crew {
  id: number;
  name: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
}

interface CrewCardProps {
  crew: Crew;
}

export default function CrewCard({ crew }: CrewCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/crew/${crew.id}`);
  };

  return (
    <div
      className="rounded-xl overflow-hidden bg-white p-[0.5rem] w-[27.625rem] h-[21.6875rem] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* 이미지 */}
      <img
        src={crew.imageUrl || bennerLogo}
        alt={crew.name}
        onError={(e) => {
          logger.error(`❌ 이미지 로드 실패: ${crew.imageUrl}`);
          e.currentTarget.src = bennerLogo;
        }}
        className="w-[27.625rem] h-[14.0625rem] object-cover rounded-lg mb-[0.5rem]"
      />

      {/* 카테고리 뱃지 */}
      <div className="w-fit mb-1">
        <CategoryBgImgs category={crew.category} />
      </div>

      {/* 이름 */}
      <div className="font-bold text-black text-[1.25rem]">{crew.name}</div>

      {/* 설명 */}
      <div className="text-[0.875rem] text-gray-500 line-clamp-2">
        {crew.content}
      </div>

      {/* 태그 */}
      <div className="flex flex-wrap gap-[0.25rem] text-[0.75rem] text-gray-400">
        {crew.tags.map((tag) => (
          <div
            key={tag}
            className="rounded-2xl px-[0.375rem] py-[0.125rem] bg-[#EFF0F4] font-medium"
          >
            #{tag}
          </div>
        ))}
      </div>
    </div>
  );
}
