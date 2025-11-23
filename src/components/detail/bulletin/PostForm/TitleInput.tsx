import { useState, useEffect } from "react";

interface TitleInputProps {
  onValueChange?: (value: string) => void;
  value?: string;
}

const TitleInput: React.FC<TitleInputProps> = ({
  onValueChange,
  value = "",
}) => {
  const [title, setTitle] = useState(value);

  useEffect(() => {
    setTitle(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTitle(newValue);
    onValueChange?.(newValue);
  };

  return (
    <>
      <div className="font-bold mb-2">
        제목 입력<span className="text-red-500 text-base" aria-label="필수">*</span>
      </div>
      <input
        id="post-title"
        type="text"
        placeholder="제목을 입력해주세요"
        className="w-full border border-[#5e6068] p-2 rounded mb-4"
        value={title}
        onChange={handleChange}
        aria-required="true"
        aria-label="게시글 제목"
      />
    </>
  );
};

export default TitleInput;
