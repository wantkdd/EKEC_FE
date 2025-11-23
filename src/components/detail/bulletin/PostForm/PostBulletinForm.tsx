import TypeSelector from "./TypeSelector";
import { logger } from "../../utils/logger";
import PermissionSelector from "./PermissionSelector";
import TitleInput from "./TitleInput";
import ContentInput from "./ContentInput";
import SubmitButton from "./SubmitButton";
import ImageAttachment from "./ImageAttachment";
import Header from "../../header";
import Notice from "../../notice";
import Tabs from "../../tabs";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { RequestCreatePostDto } from "../../../../types/bulletin/types";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useBulletinDetail } from "../../../../hooks/bulletin/useBulletins";
import {
  useCreateBulletin,
  useUpdateBulletin,
} from "../../../../hooks/bulletin/useBulletinActions";
import { showSuccess, showError } from "../../../../utils/toast";

const PostBulletinForm = () => {
  const navigate = useNavigate();
  const { crewId, id } = useParams();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 모드 판단 (URL 경로 기반)
  const isEditMode = location.pathname.includes("/edit");
  const postId = id; // 수정 모드일 때 게시글 ID

  // 기존 게시글 데이터 불러오기 (수정 모드일 때만)
  const { data: bulletinData } = useBulletinDetail(
    isEditMode ? Number(crewId) : 0,
    isEditMode ? Number(postId) : 0
  );

  // 생성 및 수정 훅
  const createBulletinMutation = useCreateBulletin(crewId || "");
  const updateBulletinMutation = useUpdateBulletin(crewId || "", postId || "");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string; imageName: string }>
  >([]);
  const [type, setType] = useState("regular");
  const [isRequired, setIsRequired] = useState(true);
  const [allowComment, setAllowComment] = useState(true);
  const [allowPrivateComment, setAllowPrivateComment] = useState(true);
  const [allowShare, setAllowShare] = useState(true);

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && bulletinData) {
      setTitle(bulletinData.title || "");
      setContent(bulletinData.content || "");

      // 기존 이미지 데이터 설정
      if (
        bulletinData.originalImages &&
        bulletinData.originalImages.length > 0
      ) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const processedImages = bulletinData.originalImages.map(
          (img: { imageId: number; imageName: string }) => ({
            id: img.imageId,
            url: `${API_BASE_URL}/image?type=2&fileName=${img.imageName}`,
            imageName: img.imageName,
          })
        );
        setExistingImages(processedImages);
      }
    }
  }, [isEditMode, bulletinData]);

  // 기존 이미지 제거 핸들러
  const handleRemoveExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      showError("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // 수정 모드
        const userId = user?.id || 1;
        const remainingImageIds = existingImages.map((img) => img.id);
        logger.debug("🔍 수정 데이터:", {
          title,
          content,
          images,
          existingImageIds: remainingImageIds,
          existingImages,
        });
        await updateBulletinMutation.mutateAsync({
          title,
          content,
          userId,
          images,
          existingImageIds: remainingImageIds,
          type,
          isRequired,
          allowComment,
          allowPrivateComment,
          allowShare,
        });
        showSuccess("게시글이 성공적으로 수정되었습니다.");
        navigate(`/crew/${crewId}/bulletin/${postId}`);
      } else {
        // 작성 모드
        const userId = user?.id || 1;

        const postData: RequestCreatePostDto = {
          title: title,
          content: content,
          userId: userId,
          images: images,
          type,
          isRequired,
          allowComment,
          allowPrivateComment,
          allowShare,
        };

        logger.debug("PostBulletinForm - 전송할 데이터:", postData);

        await createBulletinMutation.mutateAsync(postData);
      }
    } catch (error) {
      logger.error("PostBulletinForm - 오류:", error);
      showError(
        isEditMode
          ? "게시글 수정 중 오류가 발생했습니다."
          : "게시글 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {isEditMode ? "게시글 수정하기" : "게시글 등록하기"}
            </div>

            <div className="space-y-6 px-2 lg:px-6">
              <TypeSelector
                type={type}
                setType={setType}
                isRequired={isRequired}
                setIsRequired={setIsRequired}
              />
              <PermissionSelector
                allowComment={allowComment}
                setAllowComment={setAllowComment}
                allowPrivateComment={allowPrivateComment}
                setAllowPrivateComment={setAllowPrivateComment}
                allowShare={allowShare}
                setAllowShare={setAllowShare}
              />
              <TitleInput onValueChange={setTitle} value={title} />
              <ContentInput onValueChange={setContent} value={content} />
              <ImageAttachment
                onValueChange={setImages}
                existingImages={existingImages}
                onExistingImageRemove={handleRemoveExistingImage}
              />
              <SubmitButton onClick={handleSubmit} disabled={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostBulletinForm;
