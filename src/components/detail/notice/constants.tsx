
import { privateAPI } from '../../../apis/httpClient';

const enc = (v: string | number) => encodeURIComponent(String(v));
const ok = (d: any) => d?.resultType === "SUCCESS" || d?.success;

export const CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  TOTAL_PAGES: 5,
  CATEGORY: { NUMBER: 2, NAME: "공지", TOTAL_COUNT: 4 },
  LABELS: { REQUIRED: "필독", WRITE_BUTTON: "글쓰기", BOTTOM_SECTION: "미술너 사네" },
} as const;

export const fetchNoticeList = async (crewId: string, page = 1, size = 10) => {
  const { data } = await privateAPI.get(
    `/crew/${enc(crewId)}/notice/`,
    {
      params: { page, size },
      withCredentials: true,
      headers: { Accept: "application/json" },
    }
  );

  if (!ok(data)) {
    throw new Error(data?.error?.reason || "Notice list failed");
  }

  // 서버가 { data: [...] } 또는 { data: { data: [...] } } 형태로 올 수 있음
  const d = data?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

/** 공지 작성 */
export const createNotice = async (
  crewId: string,
  title: string,
  content: string,
  options?: { isRequired?: boolean; type?: 0 | 1 }
) => {
  const url = `/crew/${enc(crewId)}/notice/`;
  const typeNum =
    typeof options?.type === "number"
      ? options.type === 1
        ? 1
        : 0
      : options?.isRequired
      ? 1
      : 0;
  const body = {
    title,
    content,
    type: typeNum, // 0: 일반, 1: 필독
  };

  try {
    const { data } = await privateAPI.post(url, body, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      withCredentials: true,
    });
    if (!ok(data)) throw new Error(data?.error?.reason || "공지 작성에 실패했습니다.");
    return data;
  } catch (err: any) {
    const reason = err?.response?.data?.error?.reason || err?.message || "Create failed";
    throw new Error(reason);
  }
};

/** 내 역할 조회 (명세: { memberId, role }) */
export const fetchMyRole = async (crewId: string) => {
  const url = `/crew/${enc(crewId)}/myrole/`;
  try {
    const { data } = await privateAPI.get(url, {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
    if (!ok(data)) throw new Error(data?.error?.reason || "MyRole failed");
    return data.data; // { memberId, role }
  } catch (err: any) {
    if (err?.response?.status === 403) return { role: "GUEST" };
    throw new Error(err?.response?.data?.error?.reason || err?.message || "MyRole failed");
  }
};

/** 공지 삭제 */
export const deleteNotice = async (crewId: string, noticeId: string) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/`;
  const { data } = await privateAPI.delete(url, {
    withCredentials: true,
    headers: { Accept: "application/json" },
  });
  if (!ok(data)) throw new Error(data?.error?.reason || "Delete failed");
  return data;
};

export const toggleNoticeLike = async (crewId: string | number, noticeId: string | number) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/like`;
  try {
    const { data } = await privateAPI.post(
      url,
      {},
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, withCredentials: true }
    );
    if (data?.resultType !== "SUCCESS") throw new Error(data?.error?.reason || "Like toggle failed");
    return data; // data: { isLiked, totalLikes, ... }
  } catch (err: any) {
    const reason = err?.response?.data?.error?.reason || err?.message || "Like toggle failed";
    throw new Error(reason);
  }
};

export const getNoticeDetail = async (crewId: string, noticeId: string) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}`;
  const { data } = await privateAPI.get(url, {
    withCredentials: true,
    headers: { Accept: "application/json" },
  });
  if (data?.resultType !== "SUCCESS") {
    throw new Error(data?.error?.reason || "Notice detail failed");
  }
  return data; 
};

/** 댓글 목록 조회 ( /comment/ → 실패시 /comments/ 폴백 ) */
export const fetchNoticeComments = async (
  crewId: string | number,
  noticeId: string | number
) => {
  const base = `/crew/${enc(crewId)}/notice/${enc(noticeId)}`;
  const url1 = `${base}/comment/?ts=${Date.now()}`;
  const url2 = `${base}/comments/?ts=${Date.now()}`;

  const tryGet = async (url: string) => {
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

    // 최신순
    normalized.sort((a: any, b: any) => (a.createdAt > b.createdAt ? -1 : 1));
    return { ...data, data: normalized };
  };

  try {
    return await tryGet(url1);
  } catch (e: any) {
    const code = e?.response?.status;
    if (code === 404) {
      // /comment/ 없으면 /comments/로 재시도
      return await tryGet(url2);
    }
    throw new Error(e?.response?.data?.error?.reason || e?.message || "Comment list failed");
  }
};

/** 댓글 작성 (403 메시지 보강) */
export const createNoticeComment = async (
  crewId: string | number,
  noticeId: string | number,
  content: string
) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/comment/`;
  try {
    const { data } = await privateAPI.post(
      url,
      { content }, // 서버가 세션으로 작성자 식별하므로 crewMemberId 보내지 않음
      {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        withCredentials: true,
      }
    );
    if (!ok(data)) throw new Error(data?.error?.reason || "Comment create failed");
    return data.data; // 호출부 호환 유지
  } catch (err: any) {
    const status = err?.response?.status;
    const reason = err?.response?.data?.error?.reason || err?.message || "Comment create failed";
    if (status === 403) {
      // 권한 이슈 가시화(멤버만 댓글 허용인 서버 정책일 가능성)
      throw new Error(`댓글 권한 없음: ${reason}`);
    }
    throw new Error(reason);
  }
};

/** 댓글 수정 (PUT → 실패 시 PATCH 폴백) */
export const updateNoticeComment = async (
  crewId: string | number,
  noticeId: string | number,
  commentId: string | number,
  content: string
) => {
  const base = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/comment/${enc(commentId)}/`;
  try {
    // 1차: PUT
    const { data } = await privateAPI.put(
      base,
      { content },
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, withCredentials: true }
    );
    if (ok(data)) return data.data;
    throw new Error(data?.error?.reason || "Comment update failed");
  } catch (e: any) {
    // 404/405이면 PATCH로 폴백
    const code = e?.response?.status;
    if (code === 404 || code === 405) {
      const { data: p } = await privateAPI.patch(
        base,
        { content },
        { headers: { "Content-Type": "application/json", Accept: "application/json" }, withCredentials: true }
      );
      if (ok(p)) return p.data;
      throw new Error(p?.error?.reason || "Comment update failed");
    }
    throw new Error(e?.response?.data?.error?.reason || e?.message || "Comment update failed");
  }
};

/** 댓글 삭제 */
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

/** 공지 수정 (PUT 실패시 PATCH 폴백) */
export const updateNotice = async (
  crewId: string,
  noticeId: string,
  payload: {
    title: string;
    content: string;
    type?: 0 | 1;
    isRequired?: boolean;
  }
) => {
  const url = `/crew/${enc(crewId)}/notice/${enc(noticeId)}/`;
  const body = {
    title: payload.title,
    content: payload.content,
    type:
      typeof payload.type === "number"
        ? (payload.type === 1 ? 1 : 0)
        : payload.isRequired
        ? 1
        : 0,
  };

  const cfg = {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    withCredentials: true as const,
  };

  try {
    // 1차: PUT
    const { data } = await privateAPI.put(url, body, cfg);
    if (ok(data)) return data;
    throw new Error(data?.error?.reason || "Update failed");
  } catch (e: any) {
    const code = e?.response?.status;
    if (code === 404 || code === 405) {
      // 2차: PATCH
      const { data: p } = await privateAPI.patch(url, body, cfg);
      if (ok(p)) return p;
      throw new Error(p?.error?.reason || "Update failed");
    }
    throw new Error(e?.response?.data?.error?.reason || e?.message || "Update failed");
  }
};
