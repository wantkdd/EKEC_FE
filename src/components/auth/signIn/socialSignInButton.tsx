import { logger } from "../../../utils/logger";
interface SocialSignInButtonProps {
  provider: "google" | "kakao" | "naver";
  bgColor?: string;
  imgSrc: string;
  alt?: string;
  text: string;
  border?: string;
}

const SocialSignInButton = ({
  provider,
  bgColor,
  imgSrc,
  alt: _alt,
  text,
  border,
}: SocialSignInButtonProps) => {
  const handleSocialLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const authUrl = `${baseUrl}/auth/oauth/${provider}`;

    logger.debug(`${provider} 로그인 시작:`, authUrl);
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleSocialLogin}
      aria-label={text}
      className={`w-full relative flex items-center justify-center box-border rounded-lg font-semibold hover:shadow-md active:shadow-inner active:transform active:translate-y-0.5 text-sm md:text-base lg:text-lg h-12 md:h-14 lg:h-16 min-w-[280px] ${border || ""}`}
      style={{
        backgroundColor: bgColor || undefined,
      }}
    >
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        className="absolute left-5 flex-shrink-0 w-6 h-6"
      />
      <div className="w-full text-center text-black font-semibold px-12">
        {text}
      </div>
    </button>
  );
};

export default SocialSignInButton;
