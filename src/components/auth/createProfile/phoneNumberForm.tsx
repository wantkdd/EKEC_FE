import { useState } from "react";
import { logger } from "../../utils/logger";
import Input from "../input";
import AuthBtn from "../authBtn";
import infoIcon from "../../../assets/icons/createProfile/info.svg";

interface PhoneNumberFormProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  onComplete: () => void;
  isLoading: boolean;
}

const PhoneNumberForm = ({
  phoneNumber,
  setPhoneNumber,
  onComplete,
  isLoading,
}: PhoneNumberFormProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  // const [isVerified, setIsVerified] = useState(false);

  const handlePhoneVerification = () => {
    // TODO: 전화번호 인증 로직
    logger.debug("전화번호 인증:", phoneNumber);
  };

  // const handleCodeVerification = () => {
  //   // TODO: 인증번호 확인 로직
  //   logger.debug("인증번호 확인:", verificationCode);
  //   setIsVerified(true);
  // };

  const handleResend = () => {
    // TODO: 인증번호 재전송 로직
    logger.debug("인증번호 재전송");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-2">
      {/* 서브 컨테이너 */}
      <div className="w-full max-w-[520px] min-w-[520px]">
        {/* 전화번호 섹션 */}
        <div className="flex flex-col items-start mb-6 w-full">
          <div className="mb-2">
            <span className="text-[#2B2C31] text-xl font-semibold">
              전화번호
            </span>
            <span className="text-[#FF4949] text-xl font-semibold">*</span>
          </div>

          <div className="flex items-start gap-3 w-full">
            {/* 전화번호 */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="'-'를 제외한 전화번호를 입력하세요"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            {/* 인증하기 버튼 */}
            <button
              onClick={handlePhoneVerification}
              className="h-16 w-24 bg-indigo-700 text-white rounded-[10px] text-lg font-medium hover:bg-indigo-800 transition-colors flex items-center justify-center flex-shrink-0"
            >
              인증하기
            </button>
          </div>
        </div>

        {/* 인증번호 섹션 */}
        <div className="flex flex-col items-start mb-6 w-full">
          <div className="mb-2">
            <span className="text-[#2B2C31] text-xl font-semibold">
              인증번호 입력
            </span>
            <span className="text-[#FF4949] text-xl font-semibold">*</span>
          </div>

          <div className="flex items-start gap-3 w-full">
            {/* 인증번호 */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="인증번호를 입력해주세요"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            {/* 재전송 버튼 */}
            <button
              onClick={handleResend}
              className="h-16 w-24 bg-indigo-700 text-white rounded-[10px] text-sm md:text-base lg:text-lg font-medium hover:bg-indigo-800 transition-colors flex items-center justify-center flex-shrink-0"
            >
              재전송
            </button>
          </div>

          {/* 인증번호 안내 */}
          <div className="flex items-center gap-1 mt-2">
            <img src={infoIcon} alt="정보 아이콘" />
            <div className="text-gray-600 text-lg font-normal underline">
              인증번호가 오지 않았어요
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col items-center w-full">
          {/* 프로필 설정 완료 버튼 */}
          <AuthBtn
            onClick={onComplete}
            className="mb-4"
            disabled={!phoneNumber || isLoading}
          >
            {isLoading ? "프로필 생성 중..." : "프로필 설정 완료"}
          </AuthBtn>

          <div className="h-0 border-t border-neutral-400 mb-4 w-full" />

          {/* Pass */}
          <AuthBtn onClick={() => {}} variant="pass" disabled={isLoading}>
            Pass로 인증하기
          </AuthBtn>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberForm;
