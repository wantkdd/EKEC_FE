import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ActionButtonProps {
  label: string;
  icon: string;
  iconHover?: string;
  bgImage?: string;
  to: string;
  isActive?: boolean; // 추가: 활성화 상태 prop 필터 페이지에서 활성화 되어애 함요
}

const ActionButton = ({
  label,
  icon,
  iconHover,
  bgImage,
  to,
  isActive = false,
}: ActionButtonProps) => {
  const navigate = useNavigate();
  const [isHover, setHover] = useState(false);

  return (
    <button
      onClick={() => navigate(to)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center gap-2 w-[16.25rem] h-[3.4375rem] rounded-[0.625rem] text-[1.25rem] px-4 py-2 cursor-pointer
        focus:outline-none transition-colors ${
          bgImage
            ? "text-white"
            : isActive || isHover
              ? "bg-[#3A3ADB] text-white"
              : "bg-[#F7F7FB] text-black hover:bg-[#3A3ADB] hover:text-white"
        }`}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        />
      )}
      <img
        src={isHover || isActive ? iconHover || icon : icon}
        alt=""
        aria-hidden="true"
        className="w-[2.25rem] h-[2.25rem]"
      />
      {label}
    </button>
  );
};

export default ActionButton;
