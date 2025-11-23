import { useState, useEffect } from "react";
import { logger } from "../../utils/logger";
import { useParams } from "react-router-dom";
import TypeSelector from "./TypeSelector";
import DateSelector from "./DateSelector";
import PermissionSelector from "./PermissionSelector";
import TitleInput from "./TitleInput";
import ContentInput from "./ContentInput";
import FeeSection from "./FeeSection";
import SubmitButton from "./SubmitButton";
import Header from "../../header";
import Notice from "../../notice";
import Tabs from "../../tabs";
import { useCreateSchedule } from "../../../../hooks/schedule/useCreateSchedule";
import { useUpdateSchedule } from "../../../../hooks/schedule/useUpdateSchedule";
import { useScheduleDetail } from "../../../../hooks/schedule/useScheduleDetail";
import type { ScheduleType } from "../../../../types/detail/schedule/types";
import { showError } from "../../../../utils/toast";

const PostScheduleForm = () => {
  const { crewId, id } = useParams<{ crewId: string; id?: string }>();
  const isEditMode = !!id; // id가 있으면 수정 모드

  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();

  // 수정 모드일 때 기존 데이터 가져오기
  const { data: scheduleData, isLoading } = useScheduleDetail(
    crewId || "",
    id || "",
    { enabled: isEditMode }
  );

  // 폼 상태 관리
  const [type, setType] = useState("regular");
  const [isRequired, setIsRequired] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allowComments, setAllowComments] = useState(true);
  const [allowPrivateComments, setAllowPrivateComments] = useState(true);
  const [allowExternalShare, setAllowExternalShare] = useState(false);
  const [hasFee, setHasFee] = useState(false);
  const [fee, setFee] = useState(0);
  const [feePurpose, setFeePurpose] = useState("");

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && scheduleData?.data) {
      const schedule = scheduleData.data;
      setType(schedule.type === 0 ? "regular" : "lightning");
      setIsRequired(schedule.isRequired);
      setTitle(schedule.title);
      setContent(schedule.content);
      setSelectedDate(new Date(schedule.day));
      setHasFee(schedule.hasFee);
      if (schedule.hasFee) {
        setFee(schedule.fee);
        setFeePurpose(schedule.feePurpose || "");
      }
    }
  }, [isEditMode, scheduleData]);

  // 로딩 상태 처리
  if (isEditMode && isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">일정 정보를 불러오는 중...</div>
      </div>
    );
  }

  // 폼 제출 처리
  const handleSubmit = () => {
    if (!crewId) {
      showError("크루 ID가 없습니다.");
      return;
    }

    if (!title.trim()) {
      showError("제목을 입력해주세요.");
      return;
    }

    // HTML 태그를 제거하고 실제 텍스트 내용만 추출하여 검증
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) {
      showError("본문을 입력해주세요.");
      return;
    }

    if (!selectedDate) {
      showError("날짜를 선택해주세요.");
      return;
    }

    // 회비가 체크되어 있을 때만 회비 관련 검증
    if (hasFee) {
      if (fee <= 0) {
        showError("회비 금액을 입력해주세요.");
        return;
      }
      if (!feePurpose.trim()) {
        showError("회비 사용 목적을 입력해주세요.");
        return;
      }
    }

    // 기본 시간을 12:00으로 설정
    const dateTime = new Date(selectedDate);
    dateTime.setHours(12, 0, 0, 0);

    // API 요청 데이터 구성
    const requestData = {
      title: title.trim(),
      content: content.trim(),
      day: dateTime.toISOString(),
      type: (type === "regular" ? 0 : 1) as ScheduleType,
      isRequired,
      allowComments,
      allowPrivateComments,
      allowExternalShare,
      hasFee,
      fee: hasFee ? fee : 0,
      feePurpose: hasFee ? feePurpose.trim() : "",
    };

    logger.debug("전송할 데이터:", requestData);

    if (isEditMode && id) {
      // 수정 모드
      updateScheduleMutation.mutate({
        crewId,
        planId: id,
        scheduleData: requestData,
      });
    } else {
      // 생성 모드
      createScheduleMutation.mutate({
        crewId,
        scheduleData: requestData,
      });
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
              크루 일정 등록하기
            </div>

            <div className="space-y-6 px-2 lg:px-6">
              <TypeSelector
                type={type}
                setType={setType}
                isRequired={isRequired}
                setIsRequired={setIsRequired}
              />
              <DateSelector
                onDateChange={setSelectedDate}
                selectedDate={selectedDate}
              />
              <PermissionSelector
                allowComments={allowComments}
                allowPrivateComments={allowPrivateComments}
                allowExternalShare={allowExternalShare}
                onAllowCommentsChange={setAllowComments}
                onAllowPrivateCommentsChange={setAllowPrivateComments}
                onAllowExternalShareChange={setAllowExternalShare}
              />
              <TitleInput title={title} setTitle={setTitle} />
              <ContentInput content={content} setContent={setContent} />
              <FeeSection
                hasFee={hasFee}
                setHasFee={setHasFee}
                fee={fee}
                setFee={setFee}
                feePurpose={feePurpose}
                setFeePurpose={setFeePurpose}
              />
              <SubmitButton
                onSubmit={handleSubmit}
                isLoading={
                  isEditMode
                    ? updateScheduleMutation.isPending
                    : createScheduleMutation.isPending
                }
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScheduleForm;
