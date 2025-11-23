import { useState } from "react";
import { logger } from "../../../utils/logger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import EkecLogo from "../../../assets/icons/ic_logo_graphic_45.svg";
import checkBoxIcon from "../../../assets/icons/ic_check_de.svg";
import pressedCheckBoxIcon from "../../../assets/icons/ic_check_pressed.svg";
import warnIcon from "../../../assets/icons/auth/warn.svg";

import Input from "../input";
import AuthBtn from "../authBtn";
import {
  signInSchema,
  type SignInFormValues,
} from "../../../schemas/auth/authSchema";
import { useSignIn } from "../../../hooks/auth/useSignIn";

const EmailSignInForm: React.FC = () => {
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signInMutation = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await signInMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      logger.error("로그인 에러:", error);
    }
  };

  const handleCheckboxToggle = () => {
    setIsAutoLogin(!isAutoLogin);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-2">
      {/* 로고와 타이틀 */}
      <img src={EkecLogo} alt="EKEC 로고" className="mb-3 w-10 h-10" />

      <div className="text-center text-[#222222] text-xl md:text-2xl font-bold mb-1">
        EKEC ID 로그인
      </div>

      <div className="text-center text-[#222222] text-sm md:text-base font-normal mb-6">
        이크에크는 크루 참여 및 관리가 편리해요
      </div>

      {/* 폼 서브 컨테이너 */}
      <div className="w-full flex justify-center mt-6 ">
        <div className="w-full max-w-[90%] min-w-[300px]">
          <form
            className="flex flex-col items-center w-full gap-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full">
              <Input
                type="email"
                placeholder="이메일을 입력하세요"
                register={register("email")}
              />
              {errors?.email && (
                <div className="flex items-center justify-start text-[#ff4949] text-sm mt-1 mb-3 w-full">
                  <img src={warnIcon} alt="경고" className="w-4 h-4 mr-2" />
                  {errors.email.message}
                </div>
              )}
            </div>

            <div className="w-full">
              <Input
                type="password"
                placeholder="비밀번호를 입력하세요"
                register={register("password")}
                showPassword={showPassword}
                togglePassword={handlePasswordToggle}
              />
            </div>

            <div className="mb-4 w-full ml-6">
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={handleCheckboxToggle}
              >
                <div className="w-5 h-5 relative mr-2 flex-shrink-0">
                  <img
                    src={isAutoLogin ? pressedCheckBoxIcon : checkBoxIcon}
                    alt={isAutoLogin ? "체크박스 선택됨" : "체크박스"}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-neutral-400 text-sm md:text-lg font-medium">
                  자동 로그인
                </div>
              </div>
            </div>

            <AuthBtn type="submit" disabled={!isValid} className="mb-4">
              로그인하기
            </AuthBtn>
          </form>

          {/* 하단 링크들 */}
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 md:space-x-8 text-neutral-400 text-sm w-full">
            <Link to="/findId" className="hover:underline">
              아이디 찾기
            </Link>
            <span className="text-neutral-300">|</span>
            <Link to="/findPassword" className="hover:underline">
              비밀번호 찾기
            </Link>
            <span className="text-neutral-300">|</span>
            <Link to="/signUp" className="hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSignInForm;
