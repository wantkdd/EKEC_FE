import { useState, useEffect } from "react";
import { logger } from "../../../../utils/logger";
import { useParams } from "react-router-dom";
import Header from "../../../../components/detail/header";
import Tabs from "../../../../components/detail/tabs";
import NoticeAction from "./NoticeAction";
import NoticeComments from "./NoticeComments";
import NoticeAbout from "./NoticeAbout";
import { getNoticeDetail, toggleNoticeLike } from "../constants";
import type { Notice } from "../../../../types/notice/types";
import { showInfo, showError } from "../../../../utils/toast";

const NoticeDetail = () => {
  const { crewId, noticeId } = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!crewId || !noticeId) return;

    (async () => {
      try {
        const res = await getNoticeDetail(crewId, noticeId);
        if (res.resultType === "SUCCESS") {
          const n = res.data;

          const [date, timeWithMs] = String(n.createdAt ?? "").split("T");
          const time = timeWithMs?.slice(0, 5) || "";

          const mappedNotice = {
            id: n.id,
            title: n.title,
            content: n.content,
            date,
            time,
            hasLabel: Boolean(n.labelText),
            likeCount: Number(n.totalLikes ?? 0),
            liked: Boolean(n.isLiked),
          };

          setNotice(mappedNotice as any);
        }
      } catch (error) {
        logger.error("공지 상세 조회 실패:", error);
      }
    })();
  }, [crewId, noticeId]);

  // 댓글 수를 초기에 가져오기
  useEffect(() => {
    if (!crewId || !noticeId) return;

    const loadInitialCommentCount = async () => {
      try {
        const { fetchNoticeComments } = await import("./NoticeComments");
        const response = await fetchNoticeComments(crewId, noticeId);
        const list = Array.isArray(response?.data) ? (response.data as any[]) : [];
        if (response.resultType === "SUCCESS" || response.success) {
          setCommentCount(list.length);
        }
      } catch (err) {
        logger.error("초기 댓글 수 조회 에러:", err);
        setCommentCount(0);
      }
    };

    loadInitialCommentCount();
  }, [crewId, noticeId]);

  if (!notice) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">공지사항을 불러오는 중...</p>
      </div>
    );
  }

  // ✅ 좋아요 한 번만 허용 + 서버 응답으로 동기화
  const handleLikeToggle = async () => {
    if (!crewId || !noticeId) return;
    if (notice.liked) {
      showInfo("이미 좋아요를 눌렀습니다.");
      return;
    }
    try {
      const r = await toggleNoticeLike(crewId, noticeId);
      const s = r?.data;

      setNotice((prev) => {
        if (!prev) return prev;
        const prevCount = Number((prev as any).likeCount ?? 0);
        const nextLiked = s?.isLiked ?? true;
        const nextCount =
          typeof s?.totalLikes === "number" ? s.totalLikes : prevCount + 1;

        return { ...prev, liked: nextLiked, likeCount: nextCount };
      });
    } catch (e: any) {
      showError(e?.message ?? "좋아요 처리에 실패했습니다.");
    }
  };

  const contentHtml = String(notice.content ?? "");

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="py-6 space-y-6 pt-12">
        <div className="pt-1">
          <Header />
          <Tabs />
        </div>

        <div className="px-6 py-6 space-y-3 pt-0">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            {/* 제목 + 라벨 */}
            <div className="flex items-center space-x-2">
              {notice.hasLabel && notice.labelText && (
                <span className="bg-[#3A3ADB] text-white text-xs px-2 py-0.5 rounded-full">
                  {notice.labelText}
                </span>
              )}
              <h2 className="text-xl font-bold">{notice.title}</h2>
            </div>

            {/* 메타 + 버튼 */}
            <div className="flex justify-between items-center">
              <div className="flex py-1 items-center gap-2">
                <p className="text-sm text-gray-500">{notice.date}</p>
                <p className="text-sm text-gray-500">{notice.time}</p>
              </div>
              <button className="bg-[#3A3ADB] text-white font-semibold px-5 py-1.5 rounded-xl text-sm">
                신청완료
              </button>
            </div>

            {/* 본문 */}
            <NoticeAbout content={contentHtml} />

            <NoticeAction
              isCommentOpen={isCommentOpen}
              toggleComment={() => setIsCommentOpen((prev) => !prev)}
              initialLikeCount={Number(notice.likeCount ?? 0)}
              initialLiked={Boolean(notice.liked)}
              onLikeToggle={handleLikeToggle}
              commentCount={commentCount}
            />

            <NoticeComments
              isOpen={isCommentOpen}
              crewId={crewId ?? ""}
              noticeId={noticeId ?? ""}
              onCommentCountChange={setCommentCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
