import logo from "../../assets/icons/ic_logo graphic_74.svg";
import { logger } from "../../utils/logger";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CrewInfoStep from "../../components/crewCreate/CrewInfoStep";
import CrewApplicationStep from "../../components/crewCreate/CrewApplicationStep";
import CreateSuccessModal from "../../components/crewCreate/CreateSuccessModal";
import type {
  CrewInfoDraft,
  CrewInfoRequest,
  ServerQuestion,
} from "../../types/crewCreate/crew";
import { privateAPI } from "../../apis/httpClient";
import { toServerCrewInfo } from "../../utils/mappers/crewInfoMapper";

const crewCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CrewInfoDraft | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCrewId, setCreatedCrewId] = useState<number | null>(null);

  const handleInfoNext = (payload: {
    draft: CrewInfoDraft;
    bannerImage: File | null;
  }) => {
    setDraft(payload.draft);
    setBannerImage(payload.bannerImage);
    setStep(2);
    logger.debug("[handleInfoNext] banner:", payload.bannerImage);
  };

  const createCrewMutation = useMutation({
    mutationFn: async (vars: {
      draft: CrewInfoDraft;
      bannerImage: File | null;
      questions: ServerQuestion[];
      recruitMessage: string;
    }) => {
      const { draft, bannerImage, questions, recruitMessage } = vars;

      const crewInfo: CrewInfoRequest = toServerCrewInfo({
        ...draft,
        recruitMessage,
      });

      logger.debug("[bannerImage]", bannerImage, {
        isFile: bannerImage instanceof File,
        name: bannerImage?.name,
        size: bannerImage?.size,
        type: bannerImage?.type,
      });

      const fd = new FormData();
      if (bannerImage) {
        fd.append("bannerImage", bannerImage, bannerImage.name);
      }
      fd.append("crewInfo", JSON.stringify(crewInfo));
      fd.append("applicationForm", JSON.stringify({ questions }));

      const res = await privateAPI.post("/crew/create", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    retry: 0, // 중복 생성 방지
    onSuccess: (data) => {
      const id: number | undefined = data?.data?.crewId ?? data?.crewId;
      if (typeof id === "number") {
        setCreatedCrewId(id);
        setShowSuccess(true);
        // 목록 화면 캐시를 쓰고 있다면 무효화
        queryClient.invalidateQueries({ queryKey: ["crewList"] });
      } else {
        logger.warn("생성 성공했지만 crewId를 찾지 못했습니다.", data);
      }
    },
    onError: (err) => {
      logger.error("크루 생성 실패:", err);
    },
  });

  const handleSubmitWith = (
    applicationForm: ServerQuestion[],
    recruitMessage: string
  ) => {
    if (!draft) return;
    createCrewMutation.mutate({
      draft,
      bannerImage,
      questions: applicationForm,
      recruitMessage,
    });
  };

  const goToDetail = () => {
    if (!createdCrewId) return;
    setShowSuccess(false);
    navigate(`/crew/${createdCrewId}`);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1620px] px-50 lg:px-[235px] pt-20 pb-40">
        {/* 헤더 */}
        <div className="text-center my-20">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="logo" />
          </div>
          <h2 className="text-[40px] font-bold text-[#000000] mb-6">
            내 손에서 탄생하는 활발한 커뮤니티
          </h2>
        </div>
        {step === 1 && <CrewInfoStep onNext={handleInfoNext} />}
        {step === 2 && (
          <CrewApplicationStep
            loading={createCrewMutation.isPending}
            onSubmit={handleSubmitWith}
          />
        )}
        <CreateSuccessModal open={showSuccess} onConfirm={goToDetail} />
      </div>
    </div>
  );
};

export default crewCreatePage;
