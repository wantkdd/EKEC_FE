import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Album from "../../components/detail/album";
import { fetchCrewInfo, updateCrewIntroduction } from "./constants";
import { showError } from "../../utils/toast";

const AboutSection: React.FC = () => {
  const { crewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isEditMode = useMemo(
    () => location.pathname.split("?")[0].endsWith("/edit-intro"),
    [location.pathname]
  );

  const { data: crewInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["crewInfo", crewId],
    queryFn: () => fetchCrewInfo(crewId!),
    enabled: !!crewId,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: "always",
  });

  const [intro, setIntro] = useState("");

  // 편집 모드 진입 시, 기존 소개글을 textarea에 주입
  useEffect(() => {
    if (isEditMode) setIntro(crewInfo?.introduction ?? "");
  }, [isEditMode, crewInfo?.introduction]);

  const { mutate: saveIntro, isPending: saving } = useMutation({
    mutationFn: (text: string) => updateCrewIntroduction(crewId!, text),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["crewInfo", crewId] });
      navigate(`/crew/${crewId}`); // 보기 모드로 복귀
    },
    onError: (err: any) => showError(err?.message ?? "소개 수정에 실패했습니다."),
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-14 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-2xl py-5">
            모임 소개
          </span>
        </div>

        {/* 보기 모드: 텍스트만 표시 */}
        {!isEditMode && (
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {infoLoading
              ? "로딩중…"
              : (crewInfo?.introduction ?? "").trim().length > 0
                ? crewInfo!.introduction
                : "소개가 아직 없습니다."}
          </div>
        )}

        {/* 편집 모드: 기존 텍스트를 담은 textarea로 '대체' 표시 */}
        {isEditMode && (
          <div className="space-y-3">
            <textarea
              autoFocus
              className="w-full min-h-[240px] border border-gray-300 rounded-lg p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="모임 소개를 입력하세요…"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigate(`/crew/${crewId}`)}
                className="px-4 py-2 text-xs rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={saving}
              >
                취소
              </button>
              <button
                onClick={() => saveIntro(intro)}
                disabled={saving || !intro.trim()}
                className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "수정 중…" : "수정 완료"}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* 앨범은 항상 아래 */}
      <div className="mt-16">
        <Album crewId={Number(crewId)} />
      </div>
    </div>
  );
};

export default AboutSection;
