interface DescriptionInputSectionProps {
  value: string;
  onChange: (value: string) => void;
}

const DescriptionInputSection = ({
  value,
  onChange,
}: DescriptionInputSectionProps) => {
  const MAX_LENGTH = 20;

  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const inputEvent = e as unknown as InputEvent;
    const inputValue = inputEvent.data;

    if (value.length >= MAX_LENGTH && inputValue) {
      e.preventDefault();
    }
  };
  return (
    <div className="flex flex-col pb-8">
      <div className="flex items-center gap-4">
        <label
          htmlFor="crewDescription"
          className="font-semibold text-[22px] pb-2"
        >
          크루 소개글<span className="text-[#FF4949]" aria-label="필수">*</span>
        </label>
        <span id="descriptionHint" className="text-[#FF4949] text-lg font-normal pb-2">
          20자 내로 입력해주세요
        </span>
      </div>

      <input
        id="crewDescription"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBeforeInput={handleBeforeInput}
        maxLength={20}
        placeholder="크루를 간단하게 소개해주세요"
        aria-required="true"
        aria-label="크루 소개글"
        aria-describedby="descriptionHint charCount"
        className="border-[2px] border-[#C5C6CB] focus:border-[#3A3ADB] focus:outline-none placeholder:text-[#93959D] font-medium text-xl p-4 rounded-lg"
      />
      <div id="charCount" className="text-sm text-gray-600 mt-2">
        {value.length}/20 자
      </div>
    </div>
  );
};

export default DescriptionInputSection;
