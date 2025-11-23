import { useState } from "react";

interface ModalButtonProps {
  label: string;
  defaultIcon: string;
  hoverIcon: string;
  onClick: () => void;
  isTop?: boolean;
  isBottom?: boolean;
}

export default function ModalButton({
  label,
  defaultIcon,
  hoverIcon,
  onClick,
  isTop,
  isBottom,
}: ModalButtonProps) {
  const [hover, setHover] = useState(false);

  const rounded = isTop ? "rounded-t-xl" : isBottom ? "rounded-b-xl" : "";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      role="menuitem"
      className={`w-full px-4 py-2 text-left flex items-center gap-1 cursor-pointer hover:bg-[#ECECFC] hover:text-[#3A3ADB] ${rounded}`}
    >
      <img
        src={hover ? hoverIcon : defaultIcon}
        alt=""
        aria-hidden="true"
        className="w-4 h-4"
      />
      {label}
    </button>
  );
}
