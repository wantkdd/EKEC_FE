import { useEffect } from "react";
import { logger } from "../../utils/logger";
import { useNavigate } from "react-router-dom";
import { refreshApi } from "../../../apis/auth";
import { useAuthStore } from "../../../store/useAuthStore";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const loadAvatar = useAuthStore.getState().loadAvatar;

  useEffect(() => {
    const handleOAuthLogin = async () => {
      try {
        const response = await refreshApi();

        if (response.resultType === "SUCCESS" && response.data) {
          const { isCompleted } = response.data;

          setUser(response.data);
          setStatus("authenticated");
          await loadAvatar();

          if (isCompleted) {
            navigate("/");
          } else {
            navigate("/createProfile");
          }
        } else {
          throw new Error("유저 정보 없음");
        }
      } catch (err) {
        logger.error("OAuth 로그인 처리 중 에러:", err);
        setUser(null);
        setStatus("unauthenticated");
        navigate("/signIn");
      }
    };

    handleOAuthLogin();
  }, []);

  return <div>로그인 처리 중입니다...</div>;
};

export default OAuthSuccess;
