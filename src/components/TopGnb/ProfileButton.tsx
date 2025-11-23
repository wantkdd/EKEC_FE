import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileModal from "./ProfileModal";
import { useAuthStore } from "../../store/useAuthStore";
import defaultProfile from "../../assets/logo/defaultProfileImg.svg";

export default function ProfileButton() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const avatarUrl = useAuthStore((s) => s.avatarUrl);

  const profileSrc = avatarUrl ?? defaultProfile;

  const handleMypage = () => {
    setIsOpen(false);
    navigate("/myPage");
  };
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        onClick={handleProfileClick}
        aria-label={`${user?.nickname} 님의 프로필 메뉴 열기`}
        aria-expanded={isOpen}
        className="flex w-[9.06rem] cursor-pointer h-12 items-center space-x-2 transition-transform duration-300 ease-in-out hover:scale-110"
      >
        <img
          src={profileSrc}
          alt=""
          aria-hidden="true"
          className="w-[1.625rem] h-[1.625rem] rounded-full object-cover"
        />

        <span className="text-lg w-[5.44rem] h-[1.625rem] font-medium text-left flex-shrink-0">
          {user?.nickname} 님
        </span>
      </button>
      {isOpen && (
        <ProfileModal
          onClose={() => setIsOpen(false)}
          onMyPage={handleMypage}
        />
      )}
    </>
  );
}
