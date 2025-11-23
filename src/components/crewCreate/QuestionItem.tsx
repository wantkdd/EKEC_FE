import { useEffect, useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { QuestionData } from "../../types/crewCreate/crew";
import uncheckedIcon from "../../assets/icons/ic_check_de.svg";
import deleteIcon from "../../assets/icons/ic_trash_ arrow.svg";
import addIcon from "../../assets/icons/ic_circleplus_ arrow.svg";
import dismissIcon from "../../assets/icons/ic_dissmiss_28.svg";
import radioPressedIcon from "../../assets/icons/ic_radio_pressed.svg";
import radioDeIcon from "../../assets/icons/ic_radio_de.svg";

interface QuestionItemProps {
  data: QuestionData;
  index: number;
  onChange: (newData: QuestionData) => void;
  onDelete: () => void;
  onAdd: () => void;
  totalCount: number;
}

const QuestionItem = ({
  index,
  data,
  onChange,
  onDelete,
  onAdd,
  totalCount,
}: QuestionItemProps) => {
  const [question, setQuestion] = useState(data.question);
  const [type, setType] = useState<"checkbox" | "long">(data.type);
  const [options, setOptions] = useState(data.options);
  const [isRequired, setIsRequired] = useState(data.required);
  const [hasEtc, setHasEtc] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    onChange({
      ...data,
      question,
      type,
      options,
      required: isRequired,
      hasEtc,
    });
  }, [question, type, options, isRequired, hasEtc]);

  const handleOptionChange = (i: number, value: string) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i: number) =>
    setOptions(options.filter((_, idx) => idx !== i));

  return (
    <>
      <div className="flex gap-6 items-start p-8 bg-[#F7F7FB] rounded-lg">
        {/* 질문 번호 */}
        <span className="font-semibold text-[1.675rem] text-[#2B2C31] mt-3">
          {index + 1}.
        </span>
        {/* 오른쪽 */}
        <div className="flex flex-col gap-4 w-full pr-4">
          {/* 질문 입력 + 타입 선택 */}
          <div className="flex gap-8">
            <input
              type="text"
              placeholder="질문을 입력해주세요"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 placeholder:text-[#93959D] placeholder:font-medium placeholder:text-xl text-xl font-medium focus:border-[#3A3ADB] focus:outline-none border-[2px] border-[#D9DADD] bg-white w-full p-4 rounded-lg focus:outline-none"
            />
            {/* 라디오 버튼 - 체크박스형/장문형 선택 */}
            <div className="flex items-center gap-6">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setType("checkbox")}
              >
                <img
                  src={type === "checkbox" ? radioPressedIcon : radioDeIcon}
                  alt="checkbox type"
                />
                <span className="text-[#93959D] text-xl font-medium">
                  체크박스
                </span>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setType("long")}
              >
                <img
                  src={type === "long" ? radioPressedIcon : radioDeIcon}
                  alt="long type"
                />
                <span className="text-[#93959D] text-xl font-medium">
                  장문형
                </span>
              </div>
            </div>
          </div>
          {/* 조건부 렌더링 영역 */}
          {type === "checkbox" ? (
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={`opt-${i}`} className="relative w-full">
                  <img
                    src={uncheckedIcon}
                    alt="checkbox"
                    className="absolute left-0 translate-y-1/3"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`항목 ${i + 1}을 입력해주세요`}
                    className="w-full pl-10 border-b-[1px] border-[#C5C6CB] pt-2 pb-4 text-lg placeholder-[#93959D] placeholder:text-lg placeholder:font-normal focus:outline-none"
                  />
                  <img
                    src={dismissIcon}
                    alt="remove"
                    className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => removeOption(i)}
                  />
                </div>
              ))}

              {/* 기타 항목 렌더링 */}
              {hasEtc && (
                <div className="relative w-full">
                  <img
                    src={uncheckedIcon}
                    alt="checkbox"
                    className="absolute left-0 translate-y-1/3"
                  />
                  <div className="pl-10 border-b-[1px] border-[#C5C6CB] pt-2 pb-4 text-[18px]">
                    기타
                  </div>
                  <img
                    src={dismissIcon}
                    alt="remove"
                    className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2"
                    onClick={() => setHasEtc(false)}
                  />
                </div>
              )}
              {/* 항목 추가 / 기타 추가 */}
              <div className="flex gap-4 mt-2">
                <button
                  onClick={addOption}
                  className="h-10 px-4 bg-[#3A3ADB] text-white text-xl font-normal rounded-full cursor-pointer"
                >
                  항목추가
                </button>
                <button
                  onClick={() => {
                    if (!hasEtc) {
                      setHasEtc(true);
                    }
                  }}
                  className="h-10 px-4 bg-[#C5C6CB] text-black text-xl font-normal rounded-full cursor-pointer"
                >
                  기타추가
                </button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              placeholder="세부 내용을 입력해주세요"
              className="w-full border-b-[1px] border-[#C5C6CB] pt-2 pb-4 text-lg placeholder-[#93959D] placeholder:text-lg placeholder:font-normal focus:outline-none"
            />
          )}

          {/* 공통 하단 영역 */}
          <div className="flex items-center gap-4 mt-4">
            {/* 답변 필수 토글 스위치 */}
            <span className="text-xl font-medium text-[#2B2C31]">
              답변 필수
            </span>
            <div
              className={`w-10 h-6 rounded-full cursor-pointer ${
                isRequired ? "bg-[#3A3ADB]" : "bg-[#93959D]"
              }`}
              onClick={() => setIsRequired(!isRequired)}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full mt-1 transition-all ${
                  isRequired ? "ml-5" : "ml-1"
                }`}
              />
            </div>
            {/* 세로 구분선 */}
            <div className="w-[2px] h-6 bg-[#93959D]" />

            <img
              src={deleteIcon}
              alt="삭제"
              className={`${
                totalCount === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "cursor-pointer "
              }`}
              onClick={() => {
                if (totalCount === 1) return;
                setDeleteModal(true);
              }}
            />
            <img
              src={addIcon}
              alt="추가"
              className="cursor-pointer"
              onClick={onAdd}
            />
          </div>
        </div>
      </div>
      {deleteModal && (
        <ConfirmDeleteModal
          onCancel={() => setDeleteModal(false)}
          onConfirm={() => {
            onDelete();
            setDeleteModal(false);
          }}
        />
      )}
    </>
  );
};

export default QuestionItem;
