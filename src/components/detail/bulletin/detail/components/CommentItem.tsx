import type { BulletinCommentData } from "../../../../../types/bulletin/types";
import ProfileImage from "../../../../common/ProfileImage";
import CommentDropdown from "./CommentDropdown";
import { formatDate, getCommentContent } from "../utils//commentUtils";
import { showError } from "../../../../../utils/toast";

type Props = {
  comment: BulletinCommentData;
  currentUserId?: number;
  bulletinAuthorId?: number;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onReport: () => void;
  onSaveEdit: (commentId: number, content: string, isPrivate: boolean) => void;
  editingCommentId: number | null;
  editContent: string;
  setEditContent: (content: string) => void;
  onCancelEdit: () => void;
};

const CommentItem = ({
  comment,
  currentUserId,
  bulletinAuthorId,
  onEdit,
  onDelete,
  onReport,
  onSaveEdit,
  editingCommentId,
  editContent,
  setEditContent,
  onCancelEdit,
}: Props) => {
  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      showError("댓글 내용을 입력해주세요.");
      return;
    }
    onSaveEdit(comment.commentId, editContent.trim(), comment.isPublic === 1);
  };

  return (
    <div className="relative bg-[#F6F7FA] px-4 py-3 rounded-lg shadow-sm text-sm flex items-center justify-between">
      <div className="flex items-center gap-2 w-[90px] shrink-0">
        <ProfileImage
          imageUrl={comment.image}
          alt={`${comment.nickname} 프로필`}
          size="sm"
        />
        <span className="text-gray-400 text-xs">
          {comment.nickname || "익명"}
        </span>
      </div>

      <div className="flex-1 px-2 text-gray-800 whitespace-pre-wrap">
        {editingCommentId === comment.commentId ? (
          // 수정 모드
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3A3ADB33]"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-[#3A3ADB] text-white rounded text-xs hover:bg-[#2a2ac0]"
              >
                저장
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          // 일반 모드
          getCommentContent(comment, currentUserId, bulletinAuthorId)
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {comment.isPublic === 1 && (
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">
            비공개
          </span>
        )}
        <span className="text-gray-400 text-sm">
          {formatDate(comment.createdAt)}
        </span>

        <div className="flex items-center gap-1">
          <button className="bg-white border border-gray-300 px-3 py-0.5 rounded-2xl text-sm cursor-pointer hover:bg-gray-50">
            답글
          </button>
          <CommentDropdown
            isAuthor={currentUserId === comment.userId}
            onEdit={() => onEdit(comment.commentId, comment.content)}
            onDelete={() => onDelete(comment.commentId)}
            onReport={onReport}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
