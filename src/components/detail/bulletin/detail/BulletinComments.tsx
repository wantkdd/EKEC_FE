import { useState } from "react";
import { logger } from "../../utils/logger";
import { AnimatePresence, motion } from "framer-motion";
import CommentForm from "./components/CommentForm";
import CommentList from "./components/CommentList";
import Pagination from "../../../detail/bulletin/button/pagination";
import { useGetBulletinComments } from "../../../../hooks/bulletin/useGetBulletinComments";
import { useCreateBulletinComment } from "../../../../hooks/bulletin/useCreateBulletinComment";
import { useUpdateBulletinComment } from "../../../../hooks/bulletin/useUpdateBulletinComment";
import { useDeleteBulletinComment } from "../../../../hooks/bulletin/useDeleteBulletinComment";
import { showSuccess, showConfirm } from "../../../../utils/toast";

type Props = {
  isOpen: boolean;
  bulletinId: number;
  crewId: string;
  currentUserId?: number;
  bulletinAuthorId?: number;
};

const BulletinComments = ({
  isOpen,
  bulletinId,
  crewId,
  currentUserId,
  bulletinAuthorId,
}: Props) => {
  const [page, setPage] = useState(1);
  const { data: commentsData, isLoading } = useGetBulletinComments(
    crewId,
    bulletinId.toString(),
    page,
    10
  );
  const createCommentMutation = useCreateBulletinComment(
    crewId,
    bulletinId.toString()
  );
  const updateCommentMutation = useUpdateBulletinComment(
    crewId,
    bulletinId.toString()
  );
  const deleteCommentMutation = useDeleteBulletinComment(
    crewId,
    bulletinId.toString()
  );

  const comments = commentsData?.data?.comments || [];
  const pagination = commentsData?.data;
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 이벤트 핸들러들
  const handleSubmit = async (content: string, isPrivate: boolean) => {
    try {
      await createCommentMutation.mutateAsync({
        content: content.trim(),
        isPublic: isPrivate ? 1 : 0,
      });
    } catch (error) {
      logger.error("댓글 작성 실패:", error);
    }
  };

  const handleEdit = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = async (
    commentId: number,
    content: string,
    isPrivateEdit: boolean
  ) => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId: commentId.toString(),
        data: {
          content,
          isPublic: isPrivateEdit ? 1 : 0,
        },
      });
      setEditingCommentId(null);
      setEditContent("");
    } catch (error) {
      logger.error("댓글 수정 실패:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleDelete = async (commentId: number) => {
    if (!(await showConfirm("댓글을 삭제하시겠습니까?"))) return;
    try {
      await deleteCommentMutation.mutateAsync(commentId.toString());
    } catch (error) {
      logger.error("댓글 삭제 실패:", error);
    }
  };

  const handleReport = () => {
    showSuccess("신고가 완료되었습니다.");
  };

  if (isLoading) {
    return <div className="text-center py-4">댓글을 불러오는 중...</div>;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="comments"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 overflow-hidden mt-4"
        >
          {/* 댓글 작성 폼 */}
          <CommentForm onSubmit={handleSubmit} isLoading={false} />

          {/* 댓글 목록 */}
          <CommentList
            comments={comments}
            currentUserId={currentUserId}
            bulletinAuthorId={bulletinAuthorId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReport={handleReport}
            onSaveEdit={handleSaveEdit}
            editingCommentId={editingCommentId}
            editContent={editContent}
            setEditContent={setEditContent}
            onCancelEdit={handleCancelEdit}
          />
          
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulletinComments;
