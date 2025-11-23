import type { Notice } from "@/types/notice/types";

interface NoticeRaw {
  id: number;
  title: string;
  type: string;
  createdAt: string;
  isLiked: boolean;
  author: string;
}

export async function fetchNoticeList(crewId: string, page: number, size: number) {
  const res = await fetch(`/api/crews/${crewId}/notices?page=${page}&size=${size}`, {
    credentials: "include",
  });
  const json = await res.json();
  return json.data.map((n: NoticeRaw) => ({
    id: n.id,
    title: n.title,
    type: n.type,
    createdAt: n.createdAt,
    isLiked: n.isLiked,
    author: n.author,
  })) as Notice[];
}
