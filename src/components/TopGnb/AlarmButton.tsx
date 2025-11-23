import { useState, useRef, useEffect } from "react";
import AlarmDropDown from "./AlarmDropDown";
import noAlarm from "../../assets/icons/ic_alarm_40.svg";
import newAlarm from "../../assets/icons/ic_alarm_new_40.svg";
import useAlarm from "../../hooks/gnb/useAlarm";
import { useNavigate } from "react-router-dom";

interface ComponentAlarm {
  id: number;
  crewName: string;
  content: string;
  redirectUrl: string;
}

export default function AlarmButton() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { alarms, loading, error, unreadCount, getCrewPagePath, markAsRead } =
    useAlarm();

  // API 데이터를 컴포넌트 형태로 변환
  const componentAlarms: ComponentAlarm[] = alarms.map((alarm) => ({
    id: alarm.id,
    crewName: alarm.crew?.name || "",
    content: alarm.message,
    redirectUrl: getCrewPagePath(alarm),
  }));

  // ✨ 알람 클릭 시 읽음 처리 + 페이지 이동
  const handleAlarmClick = async (alarmId: number, redirectUrl: string) => {
    // 1. 읽음 처리 (목록에서 자동 제거됨)
    await markAsRead(alarmId);

    // 2. 해당 크루 페이지로 이동
    navigate(redirectUrl);

    // 3. 드롭다운 닫기
    setOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "알림"}
          aria-expanded={open}
          aria-haspopup="true"
          className="text-xl cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
        >
          <img
            src={unreadCount > 0 ? newAlarm : noAlarm}
            alt=""
            aria-hidden="true"
            className="w-9 h-9 object-contain align-middle"
            style={{ marginTop: "-2px" }}
          />
        </button>

        {unreadCount > 0 && (
          <span className="bg-[#3A3ADB] text-white text-xs w-12 h-6 flex items-center justify-center rounded-2xl" aria-live="polite">
            알림{unreadCount}
          </span>
        )}
      </div>

      {open && (
        <AlarmDropDown
          alarms={componentAlarms}
          loading={loading}
          error={error}
          onAlarmClick={handleAlarmClick}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
