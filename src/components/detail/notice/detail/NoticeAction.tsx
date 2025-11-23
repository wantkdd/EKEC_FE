import iconHeart from "../../../../assets/schedule/ic_Heart.svg";
import iconLikedHeart from "../../../../assets/icons/ic_liked_heart.svg";
import iconComment from "../../../../assets/icons/ic_comment.svg";
import iconShare from "../../../../assets/schedule/ic_Share.svg";
import { useEffect, useMemo, useState } from "react";
import { showError } from "../../../../utils/toast";

type Props = {
  isCommentOpen: boolean;
  toggleComment: () => void;
  isAuthor?: boolean;
  onEdit?: () => void;
  onGoToList?: () => void;
  onDelete?: () => void;

  initialLikeCount?: number;
  initialLiked?: boolean;
  onLikeToggle?: () => Promise<void> | void; // 부모에서 API 호출

  commentCount?: number;

  /** ✅ true면 liked 상태일 때 버튼 비활성(재클릭 금지) */
  disableIfLiked?: boolean;
};

const NoticeAction = ({
  toggleComment,
  isAuthor = false,
  onEdit,
  onGoToList,
  onDelete,
  initialLikeCount = 0,
  initialLiked = false,
  onLikeToggle,
  commentCount = 0,
  disableIfLiked = true, // 기본값: 한 번 누르면 잠금
}: Props) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [sending, setSending] = useState(false);

  // 부모에서 내려온 초기값 동기화 (서버에서 받은 실제 상태로 업데이트)
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);
  
  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const disabled = useMemo(
    () => (disableIfLiked && liked) || sending,
    [disableIfLiked, liked, sending]
  );

  const handleLikeClick = async () => {
    // ✅ 잠금 또는 전송중이면 무시
    if (disabled) return;

    // ✅ 이미 좋아요한 상태라면 클릭 무시
    if (liked) return;

    // 낙관적 업데이트: 즉시 UI 반영
    setLiked(true);
    setLikeCount((c) => c + 1);

    try {
      setSending(true);
      await onLikeToggle?.();
      // 부모에서 서버 응답(totalLikes/isLiked)로 다시 덮어쓸 수 있음
    } catch (error) {
      // 실패 시 롤백
      setLiked(initialLiked); // 원래 서버 상태로 복원
      setLikeCount((c) => Math.max(0, c - 1));
      showError("좋아요 처리에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center gap-2">
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-1 transition-opacity ${
            disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-70"
          }`}
          disabled={disabled}
          aria-disabled={disabled}
          title={liked ? "이미 좋아요 했어요" : "좋아요"}
        >
          <img
            src={liked ? iconLikedHeart : iconHeart}
            alt={liked ? "좋아요됨" : "좋아요"}
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-600">{likeCount}</span>
        </button>

        <button
          className="bg-white px-3 py-0.5 rounded-2xl text-sm flex items-center gap-1"
          onClick={toggleComment}
        >
          <img src={iconComment} alt="댓글" className="w-5 h-5" />
          {commentCount > 0 && (
            <span className="text-gray-600">{commentCount}</span>
          )}
        </button>
        <button>
          <img src={iconShare} alt="공유" className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isAuthor && (
          <>
            <button
              className="bg-white border border-gray-300 px-3 py-0.5 rounded-2xl text-sm hover:bg-gray-50 cursor-pointer"
              onClick={onEdit}
            >
              수정
            </button>
            <button
              className="bg-white border border-gray-300 px-3 py-0.5 rounded-2xl text-sm hover:bg-gray-50 cursor-pointer"
              onClick={onDelete}
            >
              삭제
            </button>
          </>
        )}
        <button
          className="bg-gray-200 px-3 py-0.5 rounded-2xl text-sm hover:bg-gray-300 cursor-pointer"
          onClick={onGoToList}
        >
          목록
        </button>
      </div>
    </div>
  );
};

export default NoticeAction;