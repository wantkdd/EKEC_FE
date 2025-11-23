import chatText from "../../assets/icons/ic_ChatText_40.svg";

interface Props {
  crewName: string;
  content: string;
  onClick: () => void;
}

export default function AlarmItem({ crewName, content, onClick }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <li
      onClick={handleClick}
      role="menuitem"
      aria-label={`${crewName}: ${content}`}
      className="px-4 py-4 m-3 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-start rounded-2xl bg-white"
    >
      <div className="flex items-center gap-2">
        <img src={chatText} alt="" aria-hidden="true" className="h-10 w-15" />
        <div>
          <p className="font-semibold">{crewName}</p>
          <p>{content}</p>
        </div>
      </div>
      {/* 모든 알람에 빨간 점 (읽지 않은 것만 있으므로) */}
      <span className="w-2 h-2 mt-1 bg-red-500 rounded-full" aria-label="읽지 않은 알림" />
    </li>
  );
}
