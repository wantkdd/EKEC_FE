import React, { useCallback } from "react";
import { logger } from "../../../utils/logger";
import isAttachedIcon from "../../../assets/icons/ic_isAttached.svg";
import type { Bulletin } from "../../../types/bulletin/types";
import iconHeart from "../../../assets/schedule/ic_Heart.svg";
interface BulletinItemProps {
  bulletin: Bulletin;
  onBulletinClick?: (bulletin: Bulletin) => void;
  index: number;
}

const BulletinItem: React.FC<BulletinItemProps> = ({
  bulletin,
  onBulletinClick,
  index,
}) => {
  const handleClick = useCallback(() => {
    onBulletinClick?.(bulletin);
  }, [bulletin, onBulletinClick]);

  logger.debug("Bulletin item index:", index);

  return (
    <div
      className="flex items-center justify-between py-2 px-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 rounded-lg"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* 왼쪽 영역: 인기 라벨 */}
      <div className="w-16 flex-shrink-0">
        {bulletin.isPopular && (
          <span className="bg-[#3a3adb] text-white px-2 py-1 rounded-2xl text-xs font-medium">
            인기
          </span>
        )}
      </div>

      {/* 중앙 영역: 제목 */}
      <div className="flex-1 min-w-0 px-2">
        <span className="text-gray-800 font-semibold truncate text-sm md:text-base block">
          {bulletin.title}

          {bulletin.hasAttachment && (
            <span className="text-blue-500 text-xs ml-1">
              <img
                src={isAttachedIcon}
                alt="첨부파일여부"
                className="inline-block w-4 h-4"
              />
            </span>
          )}
          {bulletin.commentCount > 0 && (
            <span className="text-blue-500 text-xs px-2">
              [{bulletin.commentCount}]
            </span>
          )}
        </span>
      </div>

      {/* 오른쪽 영역: 날짜, 좋아요 수,작성자 */}
      <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
        <span className="text-gray-400 text-sm whitespace-nowrap">
          {bulletin.date}
        </span>
        <div className="flex items-center ml-6 gap-1">
          <img src={iconHeart} alt="좋아요" className="w-4 h-4 grayscale" />
          <span className="text-[#93949D] text-sm">{bulletin.likeCount}</span>
        </div>
        <span className="text-gray-400 text-xs text-right min-w-16 truncate">
          {bulletin.author}
        </span>
      </div>
    </div>
  );
};

export default BulletinItem;
