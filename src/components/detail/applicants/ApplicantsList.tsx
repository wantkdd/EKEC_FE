import { useParams } from "react-router-dom";
import { logger } from "../../utils/logger";
import ApplicantCard from "./ApplicantCard";
import { useApplicants } from "../../../hooks/apply/useApplicants";
import { useInfinite } from "../../../hooks/apply/useInfinite";
import noApplicantsIcon from "../../../assets/icons/img_graphic3_340.svg";

export default function ApplicantsList() {
  const { crewId: crewIdParam } = useParams();
  const crewId = Number(crewIdParam);

  const { data, isLoading, isError } = useApplicants(crewId);

  // ★ 대기 중(status=0)인 지원자만 필터링
  const pendingApplicants =
    data?.all?.filter((applicant) => applicant.status === 0) ?? [];
  const pendingCount = pendingApplicants.length;

  const { ref, visible, hasMore } = useInfinite(pendingApplicants, {
    pageSize: 10,
  });

  if (!crewId) return <p className="text-red-500">유효하지 않은 크루 ID</p>;
  if (isLoading)
    return <p className="text-center mt-4">데이터 불러오는 중...</p>;
  if (isError) return <p className="text-center mt-4">불러오기 실패</p>;

  return (
    <div className="p-[1.5rem] px-[3rem] py-[2.5rem] bg-white rounded-xl shadow w-[82.625rem] mx-auto">
      <div className="text-[2.25rem] font-semibold mb-[0.5rem]">
        지원자 목록
      </div>
      <p className="text-sm text-gray-500 mb-[1rem]">전체 {pendingCount}명</p>

      {/* ★ 지원자가 없을 때 이미지와 메시지 표시 */}
      {pendingCount === 0 ? (
        <div className="text-center py-16">
          <img
            src={noApplicantsIcon}
            alt="아직 지원자가 없습니다"
            className="mx-auto mb-6 rounded-2xl w-[340px] h-[340px]"
          />
          <p className="text-xl text-gray-600 font-medium">
            아직 지원자가 없습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-[1rem]">
            {visible.map((a) => (
              <ApplicantCard
                key={a.applyid}
                name={a.nickname}
                date={a.appliedAt.slice(0, 10)}
                crewId={crewId}
                applyId={a.applyid}
                onConfirm={() => logger.debug(`${a.nickname} 확인하기 클릭`)}
              />
            ))}
          </div>

          <div ref={ref} className="h-10" />
          {hasMore && <p className="text-center mt-4">더 불러오는 중...</p>}
        </>
      )}
    </div>
  );
}
