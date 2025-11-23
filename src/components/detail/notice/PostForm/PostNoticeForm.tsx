import TypeSelector from "./TypeSelector";
import { logger } from "../../utils/logger";
import PermissionSelector from "./PermissionSelector";
import TitleInput from "./TitleInput";
import ContentInput from "./ContentInput";
import FeeSection from "./FeeSection";
import SubmitButton from "./SubmitButton";
import Header from "../../header";
import Notice from "../../notice";
import Tabs from "../../tabs";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createNotice, fetchMyRole } from "../constants";
import { showSuccess, showError } from "../../../../utils/toast";

const PostNoticeForm = () => {
  const navigate = useNavigate();
  const { crewId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("")
  const [typeRadio, setTypeRadio] = useState("regular");
  const typeNum = typeRadio === "regular" ? 1 : 0;
  const [isRequired, setIsRequired] = useState(true);
  const [fee, setFee] = useState("");
  const [allowComment, setAllowComment] = useState(false);
  const [allowPrivateComment, setAllowPrivateComment] = useState(false);
  const [allowShare, setAllowShare] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!crewId) return;

      try {
        setIsCheckingRole(true);
        const roleData = await fetchMyRole(crewId);
        logger.debug("🔍 사용자 역할 조회 결과:", roleData);

        const role = roleData?.role;
        if (typeof role === "number") {
          setUserRole(role);
        } else if (typeof role === "string") {
          if (role === "LEADER" || role === "CREW_LEADER") setUserRole(2);
          else if (role === "ADMIN" || role === "MANAGER") setUserRole(1);
          else if (role === "MEMBER" || role === "CREW_MEMBER") setUserRole(0);
          else setUserRole(0);
        } else {
          setUserRole(0);
        }
      } catch (error) {
        logger.error("역할 조회 실패:", error);
        setUserRole(0);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkUserRole();
  }, [crewId]);

  // 라디오 선택값에 따라 공지 타입 동기화
  // type: "regular"(필독=1), "flash"(일반=0)
  useEffect(() => {
    setIsRequired(typeRadio === "regular");
  }, [typeRadio]);

  const hasWritePermission = userRole !== null && userRole >= 1;

  const handleSubmit = async () => {
    if (!hasWritePermission) {
      showError(
        "공지사항 작성 권한이 없습니다. 크루장 또는 운영진만 작성할 수 있습니다."
      );
      return;
    }

    if (!title.trim() || !content.trim()) {
      showError("제목과 내용을 입력해주세요.");
      return;
    }
    if (!crewId) {
      showError("크루 ID가 없습니다.");
      return;
    }

    const cid = crewId;
    setIsSubmitting(true);
    try {
      const res = await createNotice(cid, title.trim(), content.trim(), {
        type: typeNum,
      });

      if (res?.resultType !== "SUCCESS") {
        throw new Error(
          res?.error?.reason || res?.message || "공지사항 등록에 실패했습니다."
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["notices"] });
      await queryClient.invalidateQueries({ queryKey: ["notices", cid] });
      await queryClient.invalidateQueries({
        predicate: (q) =>
          q.queryKey.some((k) => typeof k === "string" && k.includes("notice")),
      });

      showSuccess("공지사항이 성공적으로 등록되었습니다!");
      navigate(`/crew/${cid}/notice`, {
        state: { refresh: true },
      });
    } catch (err: any) {
      let msg = "등록 중 오류가 발생했습니다.";

      if (err?.response?.data?.error?.reason) {
        msg = err.response.data.error.reason;
      } else if (err?.message) {
        msg = err.message;
      }

      if (
        msg.includes("권한") ||
        msg.includes("FORBIDDEN") ||
        msg.includes("403")
      ) {
        msg =
          "공지 작성 권한이 없습니다. 크루장 또는 운영진만 공지를 작성할 수 있습니다.";
      }

      showError(msg);
      logger.error("등록 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingRole) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="mt-12 shadow-none">
          <Header />
          <Tabs />
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-lg">권한을 확인하는 중...</div>
        </div>
      </div>
    );
  }

  if (!hasWritePermission) {
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
              <div className="text-center py-20">
                <div className="text-xl font-semibold text-gray-600 mb-4">
                  공지사항 작성 권한이 없습니다
                </div>
                <div className="text-gray-500 mb-6">
                  크루장 또는 운영진만 공지사항을 작성할 수 있습니다.
                  <br />
                  현재 권한:{" "}
                  {userRole === 0
                    ? "크루원"
                    : userRole === 1
                      ? "운영진"
                      : userRole === 2
                        ? "크루장"
                        : "알 수 없음"}
                </div>
                <button
                  onClick={() => navigate(`/crew/${crewId}/notice`)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  공지사항 목록으로 돌아가기
                </button>
              </div>
            </div>
          </div>
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
              크루 공지 등록하기
            </div>

            <div className="space-y-6 px-2 lg:px-6">
              <TypeSelector
                type={typeRadio}
                setType={setTypeRadio}
                isRequired={isRequired}
                setIsRequired={setIsRequired}
              />

              <PermissionSelector
                {...{
                  allowComment,
                  setAllowComment,
                  allowPrivateComment,
                  setAllowPrivateComment,
                  allowShare,
                  setAllowShare,
                }}
              />

              <TitleInput onValueChange={setTitle} />
              <ContentInput content={content} setContent={setContent} />
              <FeeSection {...{ fee, setFee }} />
              <SubmitButton
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !crewId ||
                  !title.trim() ||
                  !content.trim() ||
                  !hasWritePermission
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostNoticeForm;
