import { useState } from "react";
import { logger } from "../../utils/logger";
import { useNavigate } from "react-router-dom";
import ToggleListButton from "./ToggleListButton";
import userIconBk from "../../assets/icons/ic_UserCircle_36.svg";
import userIconWt from "../../assets/icons/ic_UserCircle_ white_36.svg";
import { useJoinedCrewList } from "../../hooks/gnb/useJoinedCrewList";

const MyCrewButton = () => {
  const navigate = useNavigate();
  const { crewNames, crews, isLoading, isError } = useJoinedCrewList();
  const [selectedCrew, setSelectedCrew] = useState("");

  if (isLoading) {
    return (
      <ToggleListButton
        title="My 크루 (로딩 중...)"
        iconDefault={userIconBk}
        iconActive={userIconWt}
        items={[]}
        selected=""
        setSelected={() => {}}
        name="myCrew"
      />
    );
  }

  if (isError) {
    return (
      <ToggleListButton
        title="My 크루 (로드 실패)"
        iconDefault={userIconBk}
        iconActive={userIconWt}
        items={[]}
        selected=""
        setSelected={() => {}}
        name="myCrew"
      />
    );
  }

  const handleCrewChange = (crewName: string) => {
    setSelectedCrew(crewName);

    // 선택된 크루의 ID 찾기
    const selectedCrewData = crews.find((crew) => crew.crewName === crewName);

    if (selectedCrewData) {
      logger.debug("선택된 크루 ID:", selectedCrewData.crewId);

      // 해당 크루 페이지로 이동
      navigate(`/crew/${selectedCrewData.crewId}`);
    }
  };

  return (
    <ToggleListButton
      title={`My 크루`}
      iconDefault={userIconBk}
      iconActive={userIconWt}
      items={crewNames}
      selected={selectedCrew}
      setSelected={handleCrewChange}
      name="myCrew"
    />
  );
};

export default MyCrewButton;
