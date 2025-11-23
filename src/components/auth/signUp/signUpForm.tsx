import { useState } from "react";
import { logger } from "../../../utils/logger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EkecLogo from "../../../assets/icons/ic_logo_graphic_45.svg";
import warnIcon from "../../../assets/icons/auth/warn.svg";
import okIcon from "../../../assets/icons/auth/ok.svg";
import Input from "../input";
import {
  signUpSchema,
  type SignUpFormValues,
} from "../../../schemas/auth/authSchema";
import AuthBtn from "../authBtn";
import { useSignUp } from "../../../hooks/auth/useSignUp";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const signUpMutation = useSignUp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      passwordCheck: "",
    },
  });

  const watchedPassword = watch("password");

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordConfirmToggle = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await signUpMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      // 에러는 useSignUp 훅에서 처리됨
      logger.error("회원가입 실패:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-2">
      <img src={EkecLogo} alt="EKEC 로고" className="mb-3 w-10 h-10" />

      <div className="text-center text-[#222222] text-xl md:text-2xl font-bold mb-1">
        EKEC ID 회원가입
      </div>
      <div className="text-center text-[#222222] text-sm md:text-base font-normal mb-6">
        이크에크는 크루 참여 및 관리가 편리해요
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-[90%] min-w-[320px]">
          <form
            className="flex flex-col items-center w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full mt-4">
              <Input
                type="email"
                placeholder="이메일"
                register={register("email")}
              />
              {errors?.email && (
                <div className="flex items-center justify-start text-[#FF4949] text-sm mt-1 mb-3 w-full">
                  <img
                    src={warnIcon}
                    alt="경고"
                    className="w-4 h-4 mr-2 flex-shrink-0"
                  />
                  {errors.email.message}
                </div>
              )}
            </div>

            <div className="w-full mt-2">
              <Input
                type="password"
                placeholder="비밀번호"
                register={register("password")}
                showPassword={showPassword}
                togglePassword={handlePasswordToggle}
              />
            </div>

            <div className="w-full mt-2 ">
              <Input
                type="password"
                placeholder="비밀번호 확인"
                register={register("passwordCheck")}
                showPassword={showPasswordConfirm}
                togglePassword={handlePasswordConfirmToggle}
              />
              {/* 기본 가이드 텍스트 */}
              {!errors?.password && !watchedPassword ? (
                <div className="text-[#93959D] text-sm mt-1 w-full">
                  영문과 숫자, 특수문자(.!@#$%^&*)의 7~12자리
                </div>
              ) : null}
            </div>

            {/* 비밀번호 유효성 메시지 */}
            {errors?.password ? (
              <div className="text-[#FF4949] text-sm mt-1 space-y-1 w-full">
                {errors.password.message?.split("\n").map((msg, index) => (
                  <div key={index} className="flex items-center justify-start">
                    <img src={warnIcon} alt="경고" className="w-4 h-4 mr-2" />
                    {msg}
                  </div>
                ))}
              </div>
            ) : !errors?.password && watchedPassword ? (
              <div className="flex items-center justify-start text-green-500 text-sm mt-1 w-full">
                <img src={okIcon} alt="성공" className="w-4 h-4 mr-2" />
                사용 가능한 비밀번호입니다
              </div>
            ) : null}

            {/* 비밀번호 확인 에러 메시지 */}
            {errors?.passwordCheck && (
              <div className="flex items-center justify-start text-[#FF4949] text-sm mt-1 mb-2 w-full">
                <img
                  src={warnIcon}
                  alt="경고"
                  className="w-4 h-4 mr-2 flex-shrink-0"
                />
                {errors.passwordCheck.message}
              </div>
            )}

            {/* AuthBtn 사용 */}
            <AuthBtn
              type="submit"
              disabled={!isValid || signUpMutation.isPending}
              className="mb-4 mt-2"
            >
              {signUpMutation.isPending ? "회원가입 중..." : "회원가입하기"}
            </AuthBtn>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
