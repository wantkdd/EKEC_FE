interface NameInputSectionProps {
  value: string;
  onChange: (value: string) => void;
}

const NameInputSection = ({ value, onChange }: NameInputSectionProps) => {
  return (
    <div className="flex flex-col pb-8">
      <label htmlFor="crewName" className="font-semibold text-[22px] pb-2">
        크루명<span className="text-[#FF4949]" aria-label="필수">*</span>
      </label>
      <input
        id="crewName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="크루명을 입력해주세요"
        aria-required="true"
        aria-label="크루명"
        className="border-[2px] border-[#C5C6CB] focus:border-[#3A3ADB] focus:outline-none placeholder:text-[#93959D] font-medium text-xl p-4 rounded-lg"
      />
    </div>
  );
};

export default NameInputSection;
