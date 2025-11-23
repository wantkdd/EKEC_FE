import { useRef, useState } from "react";
import resetIcon from "../../assets/icons/ic_reset_28.svg";
import downIcon28 from "../../assets/icons/ic_Down_28.svg";
import closeIcon from "../../assets/icons/ic_dissmiss_20.svg";
import { getRegionId } from "../../utils/regions";
import { useRegionSelection } from "../../hooks/crewList/useRegionSelection";
import { useOutsideClick } from "../../hooks/crewList/useOutsideClick";

interface RegionMap {
  [city: string]: string[];
}

interface RegionSelectDropdownProps {
  label: string;
  regions: RegionMap;
  onChange?: (city: string, gu: string) => void;
  valueIds?: number[];
  onChangeIds?: (ids: number[]) => void;
}

const RegionSelectDropdown = ({
  label,
  regions,
  onChange,
  valueIds,
  onChangeIds,
}: RegionSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  const {
    selectedCity,
    selectedRegions,
    selectCity,
    toggleDistrict,
    removeSelected,
    reset,
  } = useRegionSelection(valueIds);

  const handleCitySelect = selectCity;
  const handleDistrictToggle = toggleDistrict;
  const handleRemoveSelected = removeSelected;

  const apply = () => {
    setOpen(false);
    const ids = selectedRegions
      .map(({ city, district }) => getRegionId(city, district))
      .filter((n): n is number => Number.isFinite(n));
    onChangeIds?.(ids);
    if (!onChangeIds) {
      const first = selectedRegions[0];
      if (first) onChange?.(first.city, first.district);
    }
  };

  const getButtonLabel = () => {
    if (selectedRegions.length === 0) return label;
    const joined = selectedRegions
      .map((r) => `${r.city} ${r.district}`)
      .join(" · ");
    return joined.length > 8 ? joined.slice(0, 8) + "..." : joined;
  };

  const isSelected = selectedRegions.length > 0;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          inline-flex items-center gap-2 px-5 h-12 rounded-full border-[2px] text-xl font-normal cursor-pointer
          ${isSelected ? "border-[#3A3ADB] bg-[#ECECFC]" : "border-[#D9DADD] bg-white"}
          text-[#000000] max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis
        `}
      >
        {getButtonLabel()}
        <img src={downIcon28} alt="열기" />
      </button>

      {open && (
        <div className="absolute mt-2 pt-2 bg-white shadow-md rounded-md z-10 flex flex-col w-[90vw] max-w-[500px]">
          <div className="flex h-[70vh] max-h-[370px]">
            {/* 시/도 */}
            <div className="w-1/2 overflow-y-auto pr-2 text-xl">
              {Object.keys(regions).map((city) => (
                <div
                  key={city}
                  className={`cursor-pointer px-2 py-2 ${selectedCity === city ? "bg-[#3A3ADB] text-white" : "text-black"}`}
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </div>
              ))}
            </div>

            {/* 구/군 */}
            <div className="w-1/2 overflow-y-auto pl-2 bg-[#F7F7FB] text-xl">
              {selectedCity &&
                regions[selectedCity].map((district) => {
                  const selected = selectedRegions.find(
                    (r) => r.city === selectedCity && r.district === district
                  );
                  return (
                    <div
                      key={district}
                      className={`cursor-pointer px-2 py-2 ${selected ? "text-[#3A3ADB]" : "text-black"}`}
                      onClick={() => handleDistrictToggle(district)}
                    >
                      {district}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-[#EFF0F4]">
            {/* 태그 */}
            <div className="flex flex-wrap p-4 gap-2 bg-[#EFF0F4]">
              {selectedRegions.map((r) => (
                <div
                  key={`${r.city}-${r.district}`}
                  className="flex items-center gap-1 px-2 py-1 bg-[#C5C6CB] rounded-md text-base font-medium text-[#5E6068]"
                >
                  {r.city} {r.district}
                  <button
                    onClick={() => handleRemoveSelected(r.city, r.district)}
                    className="text-[#5E6068] cursor-pointer"
                  >
                    <img src={closeIcon} alt="삭제" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center gap-2 p-4">
              <button
                onClick={reset}
                className="w-24 h-8 flex items-center justify-center gap-1 bg-[#C5C6CB] rounded text-[#37383E] text-base cursor-pointer"
              >
                <img src={resetIcon} alt="초기화" className="w-5 h-5" />
                초기화
              </button>

              <button
                onClick={apply}
                className="w-24 h-8 bg-[#3A3ADB] rounded text-white text-base cursor-pointer"
              >
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionSelectDropdown;
