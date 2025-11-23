import type { MemberCardProps } from "../../../types/detail/crewMember";
import logo from "../../../assets/logo/ic_logo graphic_45.svg";
import { logger } from "../../../utils/logger";
import dot from "../../../assets/icons/ic_Dot_36.svg";
import ToggleMenuWrapper from "./ToggleMenuWrapper";
import { useKickCrewMember } from "../../../hooks/CrewMemberList/useKickCrewMember";

export default function MemberCard({
  id,
  crewId,
  name,
  memberId,
  role,
  isSelected,
  onClick,
  onToggleClick,
  openToggleId,
  canManage = false,
  currentUserRole,
  onPromoteOrDemote,
}: MemberCardProps) {
  // 닉네임 자르기 (5글자 초과 시 ... 표시)
  const displayName = name?.length > 5 ? name.slice(0, 5) + "..." : name;

  // 현재 로그인한 유저 권한
  const isLeader = currentUserRole === "크루장";
  const isManager = currentUserRole === "운영진";

  // 현재 카드의 토글 열림 여부
  const isOpen = openToggleId === id;

  // 액션 핸들러 (실제 API 호출은 추후 연결)

  const { mutate: kick } = useKickCrewMember(crewId);
  const handleKick = () => {
    kick(memberId);
  };

  const handleWarn = () => logger.debug(`${id} 경고하기`);
  const handleRoleChange = () => {
    logger.debug(`${id} ${role === "운영진" ? "운영진 제외" : "운영진 승격"}`);
    if (onPromoteOrDemote) {
      onPromoteOrDemote(id, role === "운영진" ? 1 : 0); //  실제 값 전달
    }
  };

  return (
    <div
      className={`relative flex items-center justify-between p-[0.75rem] rounded-[0.375rem] border w-[23.375rem] h-[5rem]
        ${isSelected ? "border-blue-500" : "border-transparent"}
        bg-gray-50 hover:bg-gray-100`}
    >
      {/* 멤버 정보 (좌측) */}
      <button
        onClick={() => onClick(id)}
        className="flex items-center gap-[0.75rem] flex-1 text-left"
      >
        <div className="w-[3.75rem] h-[3.75rem] rounded-full bg-[#D8D8F8] flex items-center justify-center">
          <img
            src={logo}
            alt="기본 로고"
            className="w-[1.625rem] h-[1.625rem]"
          />
        </div>
        <div className="flex items-center justify-between flex-1">
          <span className="font-medium text-[1.375rem]" title={name}>
            {displayName}
          </span>
          {role && (
            <div
              className={`flex items-center justify-center text-[1rem] rounded-full w-[3.875rem] h-[1.625rem]
                ${
                  role === "크루장"
                    ? "text-white bg-[#3A3ADB]"
                    : role === "운영진"
                      ? "text-[#3A3ADB] border-[0.125rem] border-[#3A3ADB] bg-[#ECECFC]"
                      : "text-gray-600 bg-gray-100"
                }`}
            >
              {role}
            </div>
          )}
        </div>
      </button>

      {/* 토글 버튼 (우측) */}
      {canManage && (
        <div className="relative toggle-container">
          <button
            onClick={() => onToggleClick(id)}
            className="w-[2rem] h-[2rem] flex items-center justify-center rounded-full hover:bg-gray-200 ml-[0.5rem]"
          >
            <img src={dot} alt="더보기" />
          </button>

          {isOpen && (
            <ToggleMenuWrapper
              isOpen={isOpen}
              onClose={() => onToggleClick(id)}
              role={role}
              isLeader={isLeader}
              isManager={isManager}
              onKick={handleKick}
              onWarn={handleWarn}
              onRoleChange={handleRoleChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
