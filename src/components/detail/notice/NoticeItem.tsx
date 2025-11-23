import React, { useCallback } from "react";
import { logger } from "../../../utils/logger";
import type { NoticeItemProps } from "../../../types/notice/types";
import iconHeart from "../../../assets/schedule/ic_Heart.svg";

const NoticeItem: React.FC<NoticeItemProps> = ({
  notice,
  onNoticeClick,
  index,
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      logger.debug("NoticeItem 클릭됨:", notice);
      logger.debug("onNoticeClick 함수 존재:", !!onNoticeClick);

      if (onNoticeClick) {
        onNoticeClick(notice);
      } else {
        logger.error("onNoticeClick 함수가 전달되지 않았습니다");
      }
    },
    [notice, onNoticeClick]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick(e as any);
      }
    },
    [handleClick]
  );

  logger.debug("Notice item render - index:", index, "notice:", notice);

  return (
    <div
      className="flex items-center py-2 px-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 rounded-lg"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ userSelect: "none" }}
    >
      {/* 필독 라벨 */}
      <div className="w-16 flex-shrink-0">
        {notice.type === 1 && (
          <span className="px-2 py-1 rounded-2xl text-xs font-medium bg-[#3a3adb] text-white">
            필독
          </span>
        )}
        {notice.type === 0 && (
          <span className="px-2 py-1 rounded-2xl text-xs font-medium bg-[#3a3adb] text-white">
            인기
          </span>
        )}
      </div>

      {/* 제목 */}
      <div className="flex-1 min-w-0 px-2 mr-4">
        <span className="text-gray-800 font-semibold truncate text-sm md:text-base block">
          {notice.title}
        </span>
      </div>

      {/* 년월일 */}
      <div className="flex-shrink-0 mr-4">
        <span className="text-gray-400 text-xs md:text-sm">{notice.date}</span>
      </div>

      {/* 하트아이콘 */}
      <div className="flex-shrink-0 mr-2">
        <img src={iconHeart} alt="좋아요" className="w-4 h-4" />
      </div>

      {/* 하트수 */}
      <div className="flex-shrink-0 mr-4">
        <span className="text-gray-600 text-xs md:text-sm">{notice.likeCount || 0}</span>
      </div>

      {/* 글쓴이닉네임 */}
      <div className="flex-shrink-0">
        <span className="text-gray-600 text-xs md:text-sm">{notice.author || "익명"}</span>
      </div>
    </div>
  );
};

export default NoticeItem;