import { useNavigate } from "react-router-dom";

import Kakao from "../../../assets/signIn/signInKakaoLogo.svg";
import Google from "../../../assets/signIn/signInGoogleLogo.svg";
import Naver from "../../../assets/signIn/signInNaverLogo.svg";
import Ekec from "../../../assets/signIn/signInEkecLogo.svg";
import warnIcon from "../../../assets/icons/auth/warn.svg";

import SocialSignInButton from "./socialSignInButton";
import AuthBtn from "../authBtn";

interface SignInFormProps {
  showOAuthError?: boolean;
}

const SignInForm = ({ showOAuthError = false }: SignInFormProps) => {
  const navigate = useNavigate();

  const handleEkecSignIn = () => {
    navigate("/signIn/email");
  };

  return (
    <>
      <div className="text-center mb-15">
        <div className="text-4xl font-semibold text-[#222222] mb-2 text-center leading-relaxed">
          손쉽게 내 성향에 맞는 <br /> 모임을 찾아봐요!
        </div>
        <div className="justify-center text-[#222222] text-lg font-normal font-['Pretendard']">
          이크에크는 크루 참여 및 관리가 편리해요
        </div>
      </div>

      <div
        className="space-y-3 mt-8"
        style={{ paddingLeft: "7.5%", paddingRight: "7.5%" }}
      >
        <div className="relative">
          <AuthBtn onClick={handleEkecSignIn} hasLeftIcon={true} aria-label="EKEC ID로 로그인하기">
            EKEC ID로 계속하기
          </AuthBtn>
          <img
            src={Ekec}
            alt=""
            aria-hidden="true"
            className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none"
          />
        </div>

        <SocialSignInButton
          provider="kakao"
          imgSrc={Kakao}
          alt="카카오 로고"
          text="카카오 계정으로 계속하기"
          bgColor="#FEE500"
        />
        <SocialSignInButton
          provider="naver"
          imgSrc={Naver}
          alt="네이버 로고"
          text="네이버 계정으로 계속하기"
          bgColor="#03C75A"
        />
        <SocialSignInButton
          provider="google"
          imgSrc={Google}
          alt="구글 로고"
          text="Google 계정으로 계속하기"
          border="border border-gray-300 bg-white hover:bg-gray-100"
        />

        {showOAuthError && (
          <div className="flex items-center justify-start text-[#ff4949] text-sm mt-1 mb-3 w-full">
            <img src={warnIcon} alt="경고" className="w-4 h-4 mr-2" />
            다른 방식으로 가입된 계정이에요. 재로그인해주세요.
          </div>
        )}
      </div>
    </>
  );
};

export default SignInForm;
