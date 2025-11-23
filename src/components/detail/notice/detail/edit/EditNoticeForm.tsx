import TypeSelector from "./EditTypeSelector";
import { logger } from "../../../../../utils/logger";
import PermissionSelector from "./EditPermissionSelector";
import TitleInput from "./EditTitleInput";
import ContentInput from "./EditContentInput";
import FeeSection from "./EditFeeSection";
import SubmitButton from "./EditSubmitButton";
import Header from "../../../header";
import Notice from "../../../notice";
import Tabs from "../../../tabs";
import ImageAttachment from "./EditImageAttachment";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getNoticeDetail, updateNotice } from "../../constants";
import { showSuccess, showError } from "../../../../../utils/toast";

const EditScheduleForm = () => {
  const navigate = useNavigate();
  const { crewId, noticeId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("regular");
  const [isRequired, setIsRequired] = useState(true);
  const [fee, setFee] = useState("");
  const [isFeeRequired, setIsFeeRequired] = useState(false);
  const [feePurpose, setFeePurpose] = useState("");
  const [allowComment, setAllowComment] = useState(false);
  const [allowPrivateComment, setAllowPrivateComment] = useState(false);
  const [allowShare, setAllowShare] = useState(false);
  const queryClient = useQueryClient();
  const [_attachedImages, setAttachedImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // 기존 저장값 불러오기 (제목/내용 초기 세팅)
  useEffect(() => {
    const fetchDetail = async () => {
      if (!crewId || !noticeId) return;
      try {
        const res = await getNoticeDetail(crewId, noticeId);
        if (res.resultType === "SUCCESS") {
          const d = res.data;
          setTitle(d.title || "");
          setContent(d.content || "");
          if (typeof d.type === "string") setType(d.type);
          if (typeof d.isRequired === "boolean") setIsRequired(d.isRequired);
          if (typeof d.allowComment === "boolean") setAllowComment(d.allowComment);
          if (typeof d.allowPrivateComment === "boolean") setAllowPrivateComment(d.allowPrivateComment);
          if (typeof d.allowShare === "boolean") setAllowShare(d.allowShare);
          if (typeof d.fee === "string" || typeof d.fee === "number") setFee(String(d.fee));
          if (typeof d.isFeeRequired === "boolean") setIsFeeRequired(d.isFeeRequired);
          if (typeof d.feePurpose === "string") setFeePurpose(d.feePurpose);
          if (Array.isArray(d.images)) setExistingImageUrls(d.images.filter((u: any) => typeof u === "string"));
        }
      } catch (err) {
        logger.error("공지 상세 조회 실패:", err);
      }
    };
    fetchDetail();
  }, [crewId, noticeId]);

  const handleSubmit = async () => {
    if (!crewId || !noticeId) {
      showError("잘못된 접근입니다.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      showError("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateNotice(crewId, noticeId, {
        title,
        content,
        type,
        isRequired,
        allowComment,
        allowPrivateComment,
        allowShare,
        fee,
        isFeeRequired,
        feePurpose,
        // Note: file uploads would require multipart; here we only pass metadata if API supports it
        images: existingImageUrls,
      } as any);
      if (res.resultType !== "SUCCESS") {
        throw new Error(res.message || "수정에 실패했습니다.");
      }

      await queryClient.invalidateQueries({ queryKey: ["notices"] });
      await queryClient.invalidateQueries({ queryKey: ["notices", crewId] });
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key) => typeof key === "string" && key.includes("notice")
          ),
      });

      showSuccess("수정 성공!");
      navigate(`/crew/${crewId}/notice/${noticeId}`);
    } catch (err: any) {
      logger.error("수정 실패:", err);
      showError(err?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function setImages(files: File[]): void {
    setAttachedImages(files);
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
              <TypeSelector {...{ type, setType, isRequired, setIsRequired }} />
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
              <TitleInput initialValue={title} onValueChange={setTitle} />
              <ContentInput initialValue={content} onValueChange={setContent} />
              <FeeSection
                fee={fee}
                setFee={setFee}
                isFeeRequired={isFeeRequired}
                setIsFeeRequired={setIsFeeRequired}
                feePurpose={feePurpose}
                setFeePurpose={setFeePurpose}
              />
              <ImageAttachment onValueChange={setImages} initialUrls={existingImageUrls} />
              <SubmitButton onClick={handleSubmit} disabled={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleForm;
