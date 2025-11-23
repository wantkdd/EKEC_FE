import { useNavigate } from "react-router-dom";
import { logger } from "../../utils/logger";
import logo from "../../assets/logo/ic_logo graphic_45.svg";
import CategoryBgImgs from "../CategoryBgImgs";

interface CrewCardProps {
  imageUrl?: string;
  category?: string;
  title: string;
  description: string;
  rightContent: React.ReactNode;
  crewId: number;
}

export default function CrewCard({
  imageUrl,
  category,
  title,
  description,
  rightContent,
  crewId,
}: CrewCardProps) {
  const hasImage = imageUrl && imageUrl.trim() !== "";
  const navigate = useNavigate();

  const handleCardClick = () => {
    logger.debug("크루아이디:", crewId);
    navigate(`/crew/${crewId}`); // 크루 디테일 페이지로 이동
  };

  return (
    <div
      className="flex items-center justify-between w-[56rem] h-[10rem] bg-[#F7F7FB] rounded-2xl px-6 cursor-pointer hover:bg-[#ECECFC] transition-colors"
      onClick={handleCardClick}
    >
      {/* 좌측 */}
      <div className="flex items-center">
        {/* 이미지 컨테이너 */}
        <div
          className={`w-[6.25rem] h-[6.25rem] rounded-full flex items-center justify-center overflow-hidden 
            ${hasImage ? "" : "bg-[#ECECFC]"}`}
        >
          {hasImage ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={logo}
              alt="기본 로고"
              className="w-[2.8125rem] h-[2.8125rem]"
            />
          )}
        </div>

        {/* 텍스트 */}
        <div className="ml-6">
          {/* 카테고리 뱃지 컴포넌트로 교체 */}
          {category && <CategoryBgImgs category={category} />}

          <div className="text-[1.5rem] font-semibold">{title}</div>
          <p className="text-[1.125rem] text-[#222222]">{description}</p>
        </div>
      </div>

      {/* 우측 - 이벤트 버블링 방지 */}
      <div onClick={(e) => e.stopPropagation()}>{rightContent}</div>
    </div>
  );
}
