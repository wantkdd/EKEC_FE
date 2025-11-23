// src/components/TopGNB/ProfileModal.tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import userBk from "../../assets/icons/topGnb/ic_line_user_black.svg";
import userCo from "../../assets/icons/topGnb/ic_line_user_co.svg";
import logOutBk from "../../assets/icons/topGnb/ic_line_logout_black.svg";
import logOutCo from "../../assets/icons/topGnb/ic_line_logout_co.svg";
import ProfileModalBtn from "./ProfileModalBtn";
import { useSignOut } from "../../hooks/auth/useSignOut";
interface Props {
  onClose: () => void;
  onMyPage: () => void;
}

export default function ProfileModal({ onClose, onMyPage }: Props) {
  const { mutate: signOut } = useSignOut();

  const modalRef = useRef<HTMLDivElement>(null);

  const handleLogoutClick = () => {
    signOut();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  const modal = (
    <div
      ref={modalRef}
      className="fixed top-13 right-15 w-[9.5rem] bg-white rounded-xl shadow-2xl z-[9999]"
      role="menu"
      aria-label="프로필 메뉴"
    >
      <ProfileModalBtn
        label="마이페이지"
        defaultIcon={userBk}
        hoverIcon={userCo}
        onClick={onMyPage}
        isTop
      />
      <ProfileModalBtn
        label="로그아웃"
        defaultIcon={logOutBk}
        hoverIcon={logOutCo}
        onClick={handleLogoutClick}
        isBottom
      />
    </div>
  );

  return createPortal(modal, document.body);
}
