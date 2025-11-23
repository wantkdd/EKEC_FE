// components/LeftGnb/LeftGnb.tsx
import LeftGnbMyCrew from "./MyCrew";
import FilterButton from "./FilterButton";
import CrewButton from "./CreateCrewButton";
import CrewCategory from "./CrewCategoryButton";

interface LeftGnbProps {
  isOpen: boolean;
  isLargeScreen: boolean;
  onClose: () => void;
}

const LeftGnb = ({ isOpen, isLargeScreen, onClose }: LeftGnbProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 작은 화면일 때 백드롭 */}
      {!isLargeScreen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        id="left-navigation"
        className={`
          fixed top-0 left-0 w-[18.75rem] h-screen px-2 pt-20 bg-white overflow-y-auto nav-scroll-hide z-50
          ${!isLargeScreen ? "shadow-lg" : ""}
        `}
        aria-label="사이드 네비게이션"
      >
        <div className="flex flex-col space-y-2 items-center pb-4">
          <CrewButton />
          <LeftGnbMyCrew />
          <FilterButton />
          <CrewCategory />
        </div>
      </nav>
    </>
  );
};

export default LeftGnb;
