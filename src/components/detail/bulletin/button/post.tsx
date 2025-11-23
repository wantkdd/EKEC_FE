import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showError } from "../../../../utils/toast";

const BulletinPostButton: React.FC = () => {
  const navigate = useNavigate();
  const { crewId } = useParams();

  const handleClick = () => {
    if (!crewId) {
      showError("crewId가 없습니다!");
      return;
    }

    navigate(`/crew/${crewId}/bulletin/post`);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-[#3A3ADB] hover:bg-blue-700 text-white text-sm py-1.5 px-7 rounded-lg"
    >
      글쓰기
    </button>
  );
};

export default BulletinPostButton;
