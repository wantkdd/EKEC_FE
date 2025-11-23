import { useState, useEffect } from "react";
import { logger } from "../../utils/logger";
import axios from "axios";
import { useMyCrewRole } from "../../../hooks/CrewMemberList/useMyCrewRole";
import { useCrewMembers } from "../../../hooks/CrewMemberList/useCrewMember";
import {
  CrewRole,
  type CrewMemberListProps,
} from "../../../types/detail/crewMember";
import { sortByRole, getRoleText } from "../../../utils/detail/CrewRole";
import Pagination from "../bulletin/button/pagination";
import MemberCard from "./MemberCard";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/common/Modal";
import noIcon from "../../../assets/icons/img_graphic3_340.svg";
export default function CrewMemberList({
  crewId,
  selection,
  onPromoteOrDemote,
  currentPage,
  onPageChange,
}: CrewMemberListProps) {
  const [showForbiddenModal, setShowForbiddenModal] = useState(false);

  // 멤버 목록
  const { data, isLoading, error } = useCrewMembers(crewId);

  // 현재 로그인 유저 권한
  const {
    data: myRole,
    isLoading: roleLoading,
    error: roleError,
  } = useMyCrewRole(crewId);

  const navigate = useNavigate();

  // 403 에러 감지
  useEffect(() => {
    // 멤버 목록 API 403 에러 체크
    if (error) {
      logger.debug("🔍 CrewMembers Error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setShowForbiddenModal(true);
        return;
      }
    }

    // 내 역할 API 403 에러 체크
    if (roleError) {
      logger.debug("🔍 MyCrewRole Error:", roleError);
      if (axios.isAxiosError(roleError) && roleError.response?.status === 403) {
        setShowForbiddenModal(true);
        return;
      }
    }
  }, [error, roleError]);

  const handleModalClose = () => {
    setShowForbiddenModal(false);
    // 이전 페이지로 이동하거나 메인으로 이동
    navigate(-1); // 또는 navigate('/');
  };

  // 403 모달이 표시되어야 하는 경우
  if (showForbiddenModal) {
    return (
      <Modal onClose={handleModalClose}>
        <div className="text-center flex flex-col justify-center items-center">
          <img src={noIcon} className="h-[340px] w-[340px]" />
          <h2 className="text-2xl font-semibold mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-6">
            해당 크루의 멤버만 크루원 목록을 확인할 수 있습니다.
          </p>
          <button
            onClick={handleModalClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            확인
          </button>
        </div>
      </Modal>
    );
  }

  if (isLoading || roleLoading) return <div>불러오는 중...</div>;
  if (error || roleError || !data) return <div>불러오기 실패</div>;

  const { members } = data;
  const sortedMembers = sortByRole(members);

  // 페이지네이션
  const itemsPerPage = 24;
  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.max(
    1,
    Math.ceil(sortedMembers.length / itemsPerPage)
  );

  return (
    <div className="p-[1.5rem] px-[3rem] py-[2.5rem] bg-white rounded-xl shadow w-[82.625rem] mx-auto">
      {/* 타이틀 */}
      <div className="flex justify-between">
        <div className="text-[2.25rem] font-semibold mb-[0.5rem]">
          크루원 목록
        </div>

        {/* 문자열 비교 대신 enum 비교 */}
        {myRole === CrewRole.LEADER && (
          <button
            onClick={() => navigate(`/crew/${crewId}/applicants`)}
            className="w-[11.0625rem] h-[3.4375rem] rounded-[0.75rem] text-[1.625rem] bg-[#3A3ADB] text-white"
          >
            지원확인
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-[1rem]">전체 {members.length}명</p>

      {/* 멤버 카드 */}
      <div className="grid grid-cols-3 gap-[1.5rem] mb-[1.5rem]">
        {paginatedMembers.map((member) => (
          <MemberCard
            key={member.memberId}
            id={member.memberId}
            memberId={member.memberId}
            crewId={crewId}
            name={member.nickname ?? "이름 없음"}
            role={getRoleText(member.role as CrewRole)}
            currentUserRole={getRoleText(myRole)}
            isSelected={selection.selectedId === member.memberId}
            openToggleId={selection.toggleId}
            onClick={selection.onSelect}
            onToggleClick={selection.onToggle}
            canManage={myRole !== CrewRole.MEMBER}
            onPromoteOrDemote={() =>
              onPromoteOrDemote(member.memberId, member.role)
            }
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
