// src/hooks/apply/useApplySubmit.ts
import { useMutation } from "@tanstack/react-query";
import { postApply } from "../../apis/crewApply";
import type { ApplyAnswer, ApplyRequestBody } from "../../types/apply/types";
import { showError } from "../../utils/toast";

function normalizeAnswers(answers: ApplyAnswer[]): ApplyAnswer[] {
  return answers.map((ans) =>
    "checkedChoices" in ans
      ? {
          recruitFormId: ans.recruitFormId,
          checkedChoices: ans.checkedChoices ?? [],
        }
      : {
          recruitFormId: ans.recruitFormId,
          answer: ans.answer?.trim() ? ans.answer : null,
        }
  );
}

export function useApplySubmit() {
  return useMutation({
    mutationFn: async ({
      crewId,
      body,
    }: {
      crewId: number;
      body: ApplyRequestBody;
    }) => {
      const payload: ApplyRequestBody = {
        ...body,
        answers: normalizeAnswers(body.answers as ApplyAnswer[]),
      };
      return await postApply(crewId, payload);
    },
    onError: (err: unknown) => {
      let msg = "지원에 실패했습니다. 잠시 후 다시 시도해주세요.";
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        msg = error.response?.data?.message || msg;
      }
      showError(msg);
    },
  });
}
