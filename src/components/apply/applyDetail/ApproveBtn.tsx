import { useState } from "react";
import { logger } from "../../../utils/logger";
import { useNavigate } from "react-router-dom"; // 추가
import {
  useApproveMutation,
  useRejectMutation,
} from "../../../hooks/apply/useApprove";
import type { ApprovalResponse } from "../../../apis/crewApply";
import Modal from "../../../components/common/Modal";
import approveimg from "../../../assets/icons/img_graphic2_340.svg";
import rejectimg from "../../../assets/icons/img_graphic3_340.svg";
interface props {
  crewId: number;
  applyId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ApproveBtn = ({ crewId, applyId, onSuccess, onError }: props) => {
  const navigate = useNavigate(); // 추가
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const approveMutation = useApproveMutation({
    onSuccess: (data: ApprovalResponse) => {
      logger.debug("승인 완료:", data.success?.message);
      setShowApproveModal(false);
      onSuccess?.();
      // 승인 완료 후 지원자 목록으로 이동
      navigate(`/crew/${crewId}/applicants`);
    },
    onError: (error: Error) => {
      logger.error("승인 실패:", error);
      setShowApproveModal(false);
      onError?.(error.message);
    },
  });

  const rejectMutation = useRejectMutation({
    onSuccess: (data: ApprovalResponse) => {
      logger.debug("거부 완료:", data.success?.message);
      setShowRejectModal(false);
      onSuccess?.();
      // 거부 완료 후 지원자 목록으로 이동
      navigate(`/crew/${crewId}/applicants`);
    },
    onError: (error: Error) => {
      logger.error("거부 실패:", error);
      setShowRejectModal(false);
      onError?.(error.message);
    },
  });

  const handleApproveClick = () => {
    setShowApproveModal(true);
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleApproveConfirm = () => {
    approveMutation.approve(crewId, applyId);
  };

  const handleRejectConfirm = () => {
    rejectMutation.reject(crewId, applyId);
  };

  const isLoading = approveMutation.isLoading || rejectMutation.isLoading;

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <button
          className={`bg-[#93959D] w-[26.3125rem] h-[4.25rem] rounded-[10px] text-white font-medium
            ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#7a7c84] active:scale-[0.98]"}
            transition-all duration-200`}
          onClick={handleRejectClick}
          disabled={isLoading}
        >
          {rejectMutation.isLoading ? "거부 중..." : "거부하기"}
        </button>
        <button
          className={`bg-[#3A3ADB] text-white w-[26.3125rem] h-[4.25rem] rounded-[10px] font-medium
            ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2e2eb8] active:scale-[0.98]"}
            transition-all duration-200`}
          onClick={handleApproveClick}
          disabled={isLoading}
        >
          {approveMutation.isLoading ? "승인 중..." : "승인하기"}
        </button>
      </div>

      {/* 승인 확인 모달 */}
      {showApproveModal && (
        <Modal
          onClose={() => setShowApproveModal(false)}
          maxWidth="max-w-[600px]"
        >
          {" "}
          {/* 모달 크기 조정 */}
          <div className="text-center">
            <div className="mb-6">
              <img
                src={approveimg}
                alt="승인"
                className="w-[340px] h-[340px] mx-auto mb-4" // h-[340] → h-[340px] 수정
              />
            </div>
            <h2 className="text-xl font-bold mb-4">
              이 크루원을 팀에 합류 시킬까요?
            </h2>
            <p className="text-gray-600 mb-6">
              승인하면 바로 크루에 합류하여 활동하게 됩니다.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 w-[238px] h-[55px]"
                onClick={() => setShowApproveModal(false)}
                disabled={approveMutation.isLoading}
              >
                취소
              </button>
              <button
                className="px-6 py-2 bg-[#3A3ADB] text-white rounded-lg hover:bg-[#2e2eb8] disabled:opacity-50 w-[238px] h-[55px]"
                onClick={handleApproveConfirm}
                disabled={approveMutation.isLoading}
              >
                {approveMutation.isLoading ? "승인 중..." : "확인"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 거부 확인 모달 */}
      {showRejectModal && (
        <Modal
          onClose={() => setShowRejectModal(false)}
          maxWidth="max-w-[600px]"
        >
          {" "}
          {/* 모달 크기 조정 */}
          <div className="text-center">
            <img
              src={rejectimg}
              alt="거부"
              className="w-[340px] h-[340px] mx-auto mb-4" // alt 수정
            />
            <h2 className="text-xl font-bold mb-4">
              이 크루원의 가입 요청을 거절하시겠어요?
            </h2>
            <p className="text-gray-600 mb-6">
              거절하면 해당 크루원은 크루에 합류하지 못합니다.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 w-[238px] h-[55px]"
                onClick={() => setShowRejectModal(false)}
                disabled={rejectMutation.isLoading}
              >
                취소
              </button>
              <button
                className="px-6 py-2 bg-[#3A3ADB] text-white rounded-lg hover:bg-[#2e2eb8] disabled:opacity-50 w-[238px] h-[55px]" // hover 색상 수정
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isLoading}
              >
                {rejectMutation.isLoading ? "거부 중..." : "확인"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
