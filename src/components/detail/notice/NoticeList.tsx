import React, { useState, useCallback, useEffect } from "react";
import { logger } from "../../../utils/logger";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import NoticeItem from "../notice/NoticeItem";
import Pagination from "../notice/button/pagination";
import PostButton from "../notice/button/post";
import type { Notice } from "../../../types/notice/types";
import { fetchNoticeList } from "./constants";
import { fetchMyRole as fetchMyRoleDetail } from "../constants";
const NoticeList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { crewId } = useParams();
  const [activeTab] = useState<string>("notice");
  
  const { data: myRole } = useQuery({
    queryKey: ["myRole", crewId],
    queryFn: () => fetchMyRoleDetail(crewId!),
    enabled: !!crewId,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  // 역할 기반 권한 체크 개선
  const canPost = React.useMemo(() => {
    if (!myRole) return false;
    const role = typeof myRole === "object" && myRole !== null && "role" in myRole ? (myRole as any).role : myRole;
    if (typeof role === 'string') {
      return role === "LEADER" || role === "MANAGER" || role === "CREW_LEADER" || role === "ADMIN";
    }
    if (typeof role === 'number') {
      return role >= 1; // 1: 운영진, 2: 크루장
    }
    return false;
  }, [myRole]);

  const {
    data: noticesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any>({
    queryKey: ["notices", crewId],
    queryFn: () => fetchNoticeList(crewId!, 1, 10),
    enabled: !!crewId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  const notices: Notice[] = React.useMemo(() => {
    logger.debug("📦 전체 응답 데이터:", noticesResponse);
    logger.debug("📦 noticesResponse.data:", noticesResponse?.data);
    logger.debug("📦 noticesResponse.data?.data:", noticesResponse?.data?.data);

    // API 응답 구조에 맞게 데이터 추출 (여러 가능한 구조 시도)
    let rawNotices: any[] = [];
    
    if (noticesResponse?.data?.data && Array.isArray(noticesResponse.data.data)) {
      rawNotices = noticesResponse.data.data;
    } else if (Array.isArray(noticesResponse?.data)) {
      rawNotices = noticesResponse.data;
    } else if (Array.isArray(noticesResponse)) {
      rawNotices = noticesResponse;
    }
    
    logger.debug("📋 추출된 rawNotices:", rawNotices);

    if (!Array.isArray(rawNotices)) return [];
    
    return rawNotices.map((n: any): Notice => ({
      id: n.id,
      title: n.title,
      content: n.content || "",
      date: n.createdAt?.split("T")[0] || "",
      time: n.createdAt?.split("T")[1]?.slice(0, 5) || "",
      // 서버의 공지 타입을 그대로 보존 (0: 일반, 1: 필독)
      // 제목에 "일반"이 포함된 경우 type을 0으로 강제 설정
      type: n.title.includes("일반") ? 0 : (typeof n.type === "number" ? n.type : 0),
      // type이 1이면 필독 공지
      hasLabel: n.type === 1 && !n.title.includes("일반"),
      labelText: (n.type === 1 && !n.title.includes("일반")) ? "필독" : undefined,
      // 좋아요 수 (API에 해당 필드가 없으므로 기본값 0)
      likeCount: 0,
      // 좋아요 상태
      liked: n.isLiked || false,
      // 작성자 닉네임 (API에서 문자열로 직접 전달됨)
      author: n.author || "익명",
    }));
  }, [noticesResponse]);

  useEffect(() => {
    if (location.state?.refresh) {
      refetch();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refetch, navigate, location.pathname]);

  const handleNoticeClick = useCallback(
    (notice: Notice) => {
      if (!crewId) return;
      navigate(`/crew/${crewId}/notice/${notice.id}`);
    },
    [navigate, crewId]
  );

  const handleWriteClick = useCallback(() => {
    if (!crewId) return;
    navigate(`/crew/${crewId}/notice/post`);
  }, [navigate, crewId]);

  if (isError) {
    const msg = error instanceof Error ? error.message : "공지 목록을 불러올 수 없습니다.";
    const isForbidden = /403/.test(msg) || /권한/.test(msg);
    return (
      <div className="flex justify-center min-h-screen bg-gray-50 pt-8">
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">
              {isForbidden ? "공지 열람 권한이 없습니다." : "공지사항을 불러오는 중 오류가 발생했습니다."}
            </p>
            <p className="text-sm text-gray-600 mb-4">에러: {msg}</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "notice":
        return (
          <>
            {isLoading && (
              <div className="text-center py-4">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            )}
            <div className="space-y-2">
              {Array.isArray(notices) && notices.length > 0 ? (
                notices.map((notice, index) => (
                  <NoticeItem
                    key={`notice-${notice.id}`}
                    notice={notice}
                    onNoticeClick={handleNoticeClick}
                    index={index}
                  />
                ))
              ) : (
                !isLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">등록된 공지가 없어요. 공지를 등록해 주세요.</p>
                  </div>
                )
              )}
            </div>
            <div className="flex justify-center items-center space-x-2 my-8">
              <Pagination
                currentPage={1}
                totalPages={Math.max(1, Math.ceil((notices?.length || 0) / 10))}
                onPageChange={() => {}}
              />
            </div>
            {canPost && (
              <div className="flex justify-center items-center space-x-4 mt-1">
                <PostButton onClick={handleWriteClick} />
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 pt-8">
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold">공지</span>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            {isLoading && <span className="text-blue-500">🔄</span>}
          </div>
        </div>
        <p className="text-gray-600 text-sm pt-2 py-4">
          전체 {notices.length}건
        </p>
        {renderContent()}
      </div>
    </div>
  );
};

export default NoticeList;