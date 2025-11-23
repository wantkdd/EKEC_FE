import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../header";
import Tabs from "../../../tabs";
import Notice from "../../../notice";
import { getNoticeDetail, updateNotice } from "../../constants";
import TitleInput from "../../PostForm/TitleInput";
import ContentInput from "../../PostForm/ContentInput";
import SubmitButton from "../../PostForm/SubmitButton";
import { showError } from "../../../../../utils/toast";

export default function NoticeEditPage() {
  const navigate = useNavigate();
  const { crewId, noticeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!crewId || !noticeId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getNoticeDetail(crewId, noticeId);
        if (res.resultType === "SUCCESS") {
          setTitle(res.data.title || "");
          setContent(res.data.content || "");
        } else {
          throw new Error(res.message || "공지 상세 조회 실패");
        }
      } catch (e: any) {
        setError(e.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [crewId, noticeId]);

  const handleSubmit = async () => {
    if (!crewId || !noticeId) return;
    if (!title.trim()) {
      showError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      showError("내용을 입력해주세요.");
      return;
    }

    try {
      const res = await updateNotice(crewId, noticeId, { title, content });
      if (res.resultType === "SUCCESS") {
        navigate(`/crew/${crewId}/notice/${noticeId}`);
      } else {
        showError(res.message || "수정에 실패했습니다.");
      }
    } catch (e: any) {
      showError(e.message || "수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/crew/${crewId}/notice/${noticeId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mt-12 shadow-none">
        <Header />
        <Tabs />
      </div>
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1200px] space-y-6 py-6">
          <Notice />
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-2xl font-bold mb-7 mt-4 px-2 lg:px-6">
              공지 수정하기
            </div>
            <div className="space-y-6 px-2 lg:px-6">
              <TitleInput initialValue={title} onValueChange={setTitle} />
              <ContentInput content={content} setContent={setContent} />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => navigate(`/crew/${crewId}/notice/${noticeId}`)}
                >
                  취소
                </button>
                <SubmitButton onClick={handleSubmit} disabled={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
