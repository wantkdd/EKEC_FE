import { useLocation, useNavigate, useParams } from "react-router-dom";

const tabItems = [
  {
    name: "소개",
    path: "/crew/:crewId",
    include: [
      "/crew/:crewId",
      "/crew/:crewId/crewmemberlist",
      "/crew/:crewId/applicants",
    ],
  },
  { name: "공지", path: "/crew/:crewId/notice" },
  { name: "일정", path: "/crew/:crewId/schedule" },
  { name: "리뷰", path: "/crew/:crewId/review" },

  { name: "게시판", path: "/crew/:crewId/bulletin" },
];

function Tabs() {
  const { crewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const id = (url: string) => url.replace(":crewId", String(crewId));

  return (
    <div className="bg-white w-full border-b border-gray-200">
      <div className="w-full px-4 flex justify-between" role="tablist" aria-label="크루 섹션 탭">
        {tabItems.map(({ name, path, include }) => {
          // include 배열이 있으면 정확히 일치하는지 확인
          const resolvedPath = id(path);
          const includePaths = include?.map(id) ?? [];

          const isActive = includePaths.length
            ? includePaths.includes(location.pathname)
            : location.pathname === resolvedPath ||
              location.pathname.startsWith(resolvedPath + "/");

          return (
            <button
              key={name}
              onClick={() => navigate(resolvedPath)}
              role="tab"
              aria-selected={isActive}
              aria-label={`${name} 탭`}
              className={`relative flex-1 text-center py-3 text-sm font-bold transition-colors duration-200
                ${isActive ? "text-[#373EE7]" : "text-[#A1A1A1]"}`}
            >
              {name}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#373EE7]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
