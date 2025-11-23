import AlarmItem from "./AlarmItem";

interface Alarm {
  id: number;
  crewName: string;
  content: string;
  redirectUrl: string;
}

interface Props {
  alarms: Alarm[];
  loading?: boolean;
  error?: string | null;
  onAlarmClick: (alarmId: number, redirectUrl: string) => void;
  onClose?: () => void;
}

export default function AlarmDropdown({
  alarms,
  loading,
  error,
  onAlarmClick,
}: Props) {
  return (
    <div
      className="absolute top-[60px] right-0 w-[25rem] bg-[#F7F7FB] rounded-2xl shadow-md z-[9999]"
      role="menu"
      aria-label="알림 목록"
    >
      <div id="alarm-header" className="p-4 font-bold mb-3 bg-white sticky top-0 z-10">알림</div>

      {loading && alarms.length === 0 && (
        <div className="p-4 text-center text-gray-500" role="status">로딩 중...</div>
      )}

      {error && (
        <div className="p-4 text-center text-red-500" role="alert">
          알림을 불러올 수 없습니다.
        </div>
      )}

      {!loading && !error && alarms.length === 0 && (
        <div className="p-4 text-center text-gray-500" role="status">
          새로운 알림이 없습니다.
        </div>
      )}

      {alarms.length > 0 && (
        <ul
          className="max-h-80 overflow-y-scroll space-y-3"
          style={{ scrollbarWidth: "thin" }}
          role="none"
        >
          {alarms.map((alarm) => (
            <AlarmItem
              key={alarm.id}
              crewName={alarm.crewName}
              content={alarm.content}
              onClick={() => onAlarmClick(alarm.id, alarm.redirectUrl)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
