import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import moreIcon from "../../../../assets/schedule/ic_More.svg";

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: string;
};

type Props = {
  isOpen: boolean;
  crewId: string;
  noticeId: string;
  onCommentCountChange?: (count: number) => void;
};

import { privateAPI } from "../../../../apis/httpClient";

/* 공통 유틸 */
const enc = (v: string | number) => encodeURIComponent(String(v));
const ok = (d: any) => d?.resultType === "SUCCESS" || d?.success;

export const CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  TOTAL_PAGES: 5,
  CATEGORY: { NUMBER: 2, NAME: "공지", TOTAL_COUNT: 4 },
  LABELS: { REQUIRED: "필독", WRITE_BUTTON: "글쓰기", BOTTOM_SECTION: "미술너 사네" },
} as const;

/* 공지 목록 */
export const fetchNoticeList = async (crewId: string, page = 1, size = 10) => {
  try {
    const url = `/crew/${enc(crewId)}/notice/?page=${enc(page)}&size=${enc(size)}`;
    const { data, status } = await privateAPI.get(url, {
      headers: { Accept: "application/json" },
      withCredentials: true,
    });
    if (status >= 500) return [];
    if (!ok(data)) {
      throw new Error(data?.error?.reason || `Notice list failed (${status})`);
    }
    const d = data?.data;
    return Array.isArray(d) ? d : d?.notices || [];
  } catch (err: any) {
    if (err?.response?.status >= 500) return [];
    throw err;
  }
};

/* 공지 작성 */
export const createNotice = async (
  crewId: string,
  title: string,
  content: string,
  options?: { isRequired?: boolean; allowComment?: boolean }
) => {
  const url = `/crew/${enc(crewId)}/notice/`;
  const body: any = {
    title,
    content,
    type: options?.isRequired ? 1 : 0,
  };
  if (options?.allowComment !== undefined) body.allowComment = options.allowComment;

  try {
    const { data } = await privateAPI.post(url, body, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      withCredentials: true,
    });
    if (!ok(data)) throw new Error(data?.error?.reason || "공지 작성에 실패했습니다.");
    return data ?? null;
  } catch (err: any) {
    const reason = err?.response?.data?.error?.reason || err?.message || "Create failed";
    throw new Error(reason);
  }
};

/* 내 역할 조회 (명세: { memberId, role }) */
export const fetchMyRole = async (crewId: string) => {
  try {
    const url = `/crew/${enc(crewId)}/myrole/`;
    const { data } = await privateAPI.get(url, {
      headers: { Accept: "application/json" },
      withCredentials: true,
    });
    if (!ok(data))
      throw new Error(data?.error?.reason || "MyRole failed");
    return data.data; // { memberId, role }
  } catch (err: any) {
    if (err?.response?.status === 403) return { role: "GUEST" as const };
    throw err;
  }
};

/* 공지 삭제 */
export const deleteNotice = async (crewId: string, noticeId: string) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/`;
  const { data } = await privateAPI.delete(url, {
    withCredentials: true,
    headers: { Accept: "application/json" },
  });
  if (!ok(data)) throw new Error(data?.error?.reason || "Delete failed");
  return data;
};

/* 좋아요 토글 */
export const toggleNoticeLike = async (crewId: string, noticeId: string) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/like/`;
  try {
    const { data } = await privateAPI.post(
      url,
      {},
      {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        withCredentials: true,
      }
    );
    if (!ok(data)) throw new Error(data?.error?.reason || "Like toggle failed");
    return data;
  } catch (err: any) {
    const reason = err?.response?.data?.error?.reason || err?.message || "Like toggle failed";
    throw new Error(reason);
  }
};

/* 공지 상세 */
export const getNoticeDetail = async (crewId: string, noticeId: string) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/`;
  const { data } = await privateAPI.get(url, {
    headers: { Accept: "application/json" },
    withCredentials: true,
  });
  if (!ok(data)) throw new Error(data?.error?.reason || "Notice detail failed");
  return data;
};

/* 댓글 목록 ( /comment/ → 실패 시 /comments/ 폴백 ) */
export const fetchNoticeComments = async (
  crewId: string | number,
  noticeId: string | number
) => {
  const base = `/crew/${enc(crewId)}/notice/${enc(noticeId)}`;
  const url1 = `${base}/comment/?ts=${Date.now()}`;
  const url2 = `${base}/comments/?ts=${Date.now()}`;

  const getList = async (url: string) => {
    const { data } = await privateAPI.get(url, {
      withCredentials: true,
      headers: { "Cache-Control": "no-cache", Accept: "application/json" },
    });
    if (!ok(data)) throw new Error(data?.error?.reason || "Comment list failed");

    const raw =
      Array.isArray(data?.data) ? data.data :
      Array.isArray(data?.data?.data) ? data.data.data :
      [];

    const normalized = raw.map((c: any) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.author || c.writer || c.nickname || "",
    }));

    normalized.sort((a: any, b: any) => (a.createdAt > b.createdAt ? -1 : 1));
    return { ...data, data: normalized };
  };

  try {
    return await getList(url1);
  } catch (e: any) {
    const code = e?.response?.status;
    if (code === 404 || code === 405) {
      return await getList(url2);
    }
    const reason = e?.response?.data?.error?.reason || e?.message || "Comment list failed";
    throw new Error(reason);
  }
};

/* 댓글 작성 (403 메시지 보강, /comment/ → /comments/ 폴백) */
export const createNoticeComment = async (
  crewId: string | number,
  noticeId: string | number,
  content: string
): Promise<any> => {
  const base = `/crew/${enc(crewId)}/notice/${enc(noticeId)}`;
  const url1 = `${base}/comment/`;
  const url2 = `${base}/comments/`;

  const post = async (url: string) => {
    const { data } = await privateAPI.post(
      url,
      { content }, // 세션으로 작성자 식별 → crewMemberId 보내지 않음
      {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        withCredentials: true,
      }
    );
    if (!ok(data)) throw new Error(data?.error?.reason || "Comment create failed");
    return data.data; // { id, content, createdAt, author ... }
  };

  try {
    return await post(url1);
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404 || status === 405) {
      return await post(url2);
    }
    const reason = e?.response?.data?.error?.reason || e?.message || "Comment create failed";
    if (status === 403) {
      throw new Error(`댓글 권한 없음: ${reason}`);
    }
    throw new Error(reason);
  }
};

/* 댓글 수정 (PUT → 실패 시 PATCH 폴백) */
export const updateNoticeComment = async (
  crewId: string | number,
  noticeId: string | number,
  commentId: string | number,
  content: string
) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/comment/${enc(commentId)}/`;

  const cfg = {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    withCredentials: true as const,
  };

  try {
    const { data } = await privateAPI.put(url, { content }, cfg);
    if (ok(data)) return data.data;
    throw new Error(data?.error?.reason || "Comment update failed");
  } catch (e: any) {
    const code = e?.response?.status;
    if (code === 404 || code === 405) {
      const { data: p } = await privateAPI.patch(url, { content }, cfg);
      if (ok(p)) return p.data;
      throw new Error(p?.error?.reason || "Comment update failed");
    }
    const reason = e?.response?.data?.error?.reason || e?.message || "Comment update failed";
    throw new Error(reason);
  }
};

/* 댓글 삭제 */
export const deleteNoticeComment = async (
  crewId: string | number,
  noticeId: string | number,
  commentId: string | number
) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/comment/${enc(commentId)}/`;
  try {
    const { data } = await privateAPI.delete(url, {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
    if (!ok(data)) throw new Error(data?.error?.reason || "Comment delete failed");
    return data;
  } catch (err: any) {
    const reason = err?.response?.data?.error?.reason || err?.message || "Comment delete failed";
    throw new Error(reason);
  }
};

/* ====== 컴포넌트 ====== */
const NoticeComments = ({ isOpen, crewId, noticeId, onCommentCountChange }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [newContent, setNewContent] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const loadComments = async () => {
    if (!isOpen || !crewId || !noticeId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNoticeComments(crewId, noticeId);
      const list = Array.isArray(response?.data) ? (response.data as Comment[]) : [];
      if (response.resultType === "SUCCESS" || response.success) {
        setComments(list);
        onCommentCountChange?.(list.length);
      } else {
        setError("댓글을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("댓글 조회 에러:", err);
      setError("댓글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    if (isOpen) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, crewId, noticeId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpenId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${y}.${m}.${d} ${hh}:${mm}`;
    } catch {
      return dateString;
    }
  };

  const handleCreate = async () => {
    const content = newContent.trim();
    if (!content) return;
    setPosting(true);
    try {
      const created = await createNoticeComment(crewId, noticeId, content);
      setComments((prev) => [
        {
          id: created.id,
          content: created.content,
          createdAt: created.createdAt,
          author: created.author || "나",
        },
        ...prev,
      ]);
      onCommentCountChange?.(comments.length + 1);
      setNewContent("");
    } catch (e: any) {
      alert(e?.message ?? "댓글 작성에 실패했습니다.");
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditingContent(c.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };
  const saveEdit = async () => {
    if (editingId == null) return;
    const content = editingContent.trim();
    if (!content) return;
    try {
      const updated = await updateNoticeComment(crewId, noticeId, editingId, content);
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, content: updated.content, createdAt: (updated.modifiedAt ?? c.createdAt) }
            : c
        )
      );
      cancelEdit();
    } catch (e: any) {
      alert(e?.message ?? "댓글 수정에 실패했습니다.");
    }
  };

  const removeComment = async (id: number) => {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    try {
      await deleteNoticeComment(crewId, noticeId, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      onCommentCountChange?.(comments.length - 1);
    } catch (e: any) {
      alert(e?.message ?? "댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="comments"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 overflow-visible mt-4"
        >
          {/* 작성 영역 */}
          <div className="flex items-center gap-2">
            <textarea
              className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-sm resize-none h-12"
              placeholder="댓글을 입력하세요."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              disabled={posting}
            />
            <button
              className="bg-[#3A3ADB] text-white text-sm px-4 py-2 rounded-lg h-12 min-w-[60px] disabled:opacity-50"
              onClick={handleCreate}
              disabled={posting || !newContent.trim()}
            >
              {posting ? "등록중" : "등록"}
            </button>
          </div>

          {/* 목록 */}
          <div className="space-y-2">
            {loading && <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>}
            {error && <div className="text-center py-4 text-red-500">{error}</div>}
            {!loading && hasLoaded && !error && comments.length === 0 && (
              <div className="text-center py-4 text-gray-500">아직 댓글이 없습니다.</div>
            )}

            {!loading &&
              !error &&
              comments.map((comment) => {
                const isEditing = editingId === comment.id;
                return (
                  <div
                    key={comment.id}
                    className="bg-[#F6F7FA] px-4 py-3 rounded-lg shadow-sm text-sm flex items-center justify-between relative"
                  >
                    <div className="flex items-center gap-3 w-[140px] shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                      <div className="text-gray-700 font-medium truncate max-w-[90px]">
                        {comment.author || "익명"}
                      </div>
                    </div>

                    <div className="flex-1 px-2 text-gray-800 min-w-0">
                      {isEditing ? (
                        <textarea
                          className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                        />
                      ) : (
                        <span className="break-words whitespace-pre-wrap">{comment.content}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-400 text-sm whitespace-nowrap">
                        {formatDate(comment.createdAt)}
                      </span>
                      <button className="px-3 py-1 rounded-2xl border border-gray-300 bg-white text-sm">
                        답글
                      </button>

                      <button
                        className="w-6 h-6 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((prev) => (prev === comment.id ? null : comment.id));
                        }}
                        aria-label="more"
                      >
                        <img src={moreIcon} alt="더보기" className="w-6 h-6" />
                      </button>

                      {menuOpenId === comment.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-2 top-10 z-[9999] w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-2"
                        >
                          {!isEditing && (
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              onClick={() => {
                                setMenuOpenId(null);
                                startEdit(comment);
                              }}
                            >
                              수정하기
                            </button>
                          )}
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                            onClick={() => {
                              setMenuOpenId(null);
                              alert("신고가 접수되었습니다.");
                            }}
                          >
                            신고하기
                          </button>
                          {!isEditing && (
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                              onClick={() => {
                                setMenuOpenId(null);
                                removeComment(comment.id);
                              }}
                            >
                              삭제하기
                            </button>
                          )}
                          {isEditing && (
                            <div className="pt-2 border-t border-gray-100">
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  saveEdit();
                                }}
                              >
                                저장
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  cancelEdit();
                                }}
                              >
                                취소
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoticeComments;
