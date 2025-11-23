import { useState } from "react";
import { showError } from "../../../../../utils/toast";

type Props = {
  onSubmit: (content: string, isPrivate: boolean) => void;
  isLoading?: boolean;
};

const CommentForm = ({ onSubmit, isLoading }: Props) => {
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) {
      showError("댓글 내용을 입력해주세요.");
      return;
    }
    onSubmit(content.trim(), isPrivate);
    setContent("");
    setIsPrivate(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter는 줄바꿈, Enter는 전송
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) handleSubmit();
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* 체크박스 */}
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded"
        />
        비공개 (작성자와 나만 볼 수 있음)
      </label>

      {/* 입력창, 버튼 */}
      <div className="flex items-stretch gap-3 w-full">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="댓글을 입력하세요."
          className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#3A3ADB33] min-w-0"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          className="h-20 min-w-[80px] px-4 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:bg-[#2a2ac0] disabled:hover:bg-gray-400"
          style={{
            backgroundColor: !content.trim() ? "#9CA3AF" : "#3A3ADB",
          }}
        >
          {isLoading ? "등록중..." : "등록"}
        </button>
      </div>
    </div>
  );
};

export default CommentForm;
