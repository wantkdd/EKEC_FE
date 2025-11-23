/**
 * apply/mapStep2 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import { mapStep2ToView, type QAViewItem } from "../mapStep2";
import { QUESTION_TYPE, type ApiQuestion } from "../../../types/apply/types";

describe("apply/mapStep2 utilities", () => {
  const mockCheckboxQuestion: ApiQuestion = {
    id: 1,
    question: "선택지 질문",
    questionType: QUESTION_TYPE.CHECKBOX,
    choiceList: { list: ["선택지1", "선택지2", "선택지3"] },
    isEtc: 0,
    required: 1,
  };

  const mockLongTextQuestion: ApiQuestion = {
    id: 2,
    question: "장문 질문",
    questionType: QUESTION_TYPE.LONG_TEXT,
    choiceList: {},
    isEtc: 0,
    required: 0,
  };

  describe("mapStep2ToView", () => {
    it("should handle empty questions array", () => {
      const result = mapStep2ToView([], undefined);
      expect(result).toEqual([]);
    });

    it("should handle undefined questions", () => {
      const result = mapStep2ToView(undefined, undefined);
      expect(result).toEqual([]);
    });

    it("should convert checkbox question to view format", () => {
      const result = mapStep2ToView([mockCheckboxQuestion], undefined);

      expect(result).toHaveLength(1);
      const item = result[0] as any;
      expect(item.type).toBe("CHECKBOX");
      expect(item.question).toBe("선택지 질문");
      expect(item.id).toBe(1);
      expect(item.required).toBe(true);
    });

    it("should convert long text question to view format", () => {
      const result = mapStep2ToView([mockLongTextQuestion], undefined);

      expect(result).toHaveLength(1);
      const item = result[0] as any;
      expect(item.type).toBe("LONG_TEXT");
      expect(item.question).toBe("장문 질문");
      expect(item.id).toBe(2);
      expect(item.required).toBe(false);
    });

    it("should map answers from detail to checkbox values", () => {
      const detail = {
        answers: [
          {
            recruitFormId: 1,
            checkedChoices: ["선택지1", "선택지3"],
          },
        ],
      };

      const result = mapStep2ToView([mockCheckboxQuestion], detail);
      const checkboxItem = result[0] as any;

      expect(checkboxItem.type).toBe("CHECKBOX");
      expect(checkboxItem.values).toEqual(["선택지1", "선택지3"]);
    });

    it("should map answers from detail to long text value", () => {
      const detail = {
        answers: [
          {
            recruitFormId: 2,
            answer: "사용자의 답변 텍스트",
          },
        ],
      };

      const result = mapStep2ToView([mockLongTextQuestion], detail);
      const longTextItem = result[0] as any;

      expect(longTextItem.type).toBe("LONG_TEXT");
      expect(longTextItem.value).toBe("사용자의 답변 텍스트");
    });

    it("should handle etc text in checkbox", () => {
      const questionWithEtc: ApiQuestion = {
        ...mockCheckboxQuestion,
        isEtc: 1,
      };

      const detail = {
        answers: [
          {
            recruitFormId: 1,
            checkedChoices: ["선택지1"],
            etcChoices: ["기타 응답1", "기타 응답2"],
          },
        ],
      };

      const result = mapStep2ToView([questionWithEtc], detail);
      const checkboxItem = result[0] as any;

      expect(checkboxItem.etcText).toContain("기타 응답1");
      expect(checkboxItem.etcText).toContain("기타 응답2");
    });

    it("should clean duplicate strings in values", () => {
      const detail = {
        answers: [
          {
            recruitFormId: 1,
            checkedChoices: ["선택지1", "선택지1", "선택지2"],
          },
        ],
      };

      const result = mapStep2ToView([mockCheckboxQuestion], detail);
      const checkboxItem = result[0] as any;

      expect(checkboxItem.values).toHaveLength(2);
      expect(checkboxItem.values).toContain("선택지1");
      expect(checkboxItem.values).toContain("선택지2");
    });

    it("should handle null values in arrays", () => {
      const detail = {
        answers: [
          {
            recruitFormId: 1,
            checkedChoices: ["선택지1", null, "선택지2", null],
          },
        ],
      };

      const result = mapStep2ToView([mockCheckboxQuestion], detail);
      const checkboxItem = result[0] as any;

      expect(checkboxItem.values).toEqual(["선택지1", "선택지2"]);
    });

    it("should handle both 'answers' and 'step2Answers' keys in detail", () => {
      const detail1 = {
        answers: [{ recruitFormId: 1, answer: "답변1" }],
      };

      const detail2 = {
        step2Answers: [{ recruitFormId: 2, answer: "답변2" }],
      };

      const result1 = mapStep2ToView([mockLongTextQuestion], detail1);
      const result2 = mapStep2ToView([mockLongTextQuestion], detail2);

      expect(result1[0]).toBeDefined();
      expect(result2[0]).toBeDefined();
    });

    it("should handle questionId instead of recruitFormId", () => {
      const detail = {
        answers: [
          {
            questionId: 1,
            checkedChoices: ["선택지1"],
          },
        ],
      };

      const result = mapStep2ToView([mockCheckboxQuestion], detail);
      const checkboxItem = result[0] as any;

      expect(checkboxItem.values).toEqual(["선택지1"]);
    });

    it("should handle mixed required and optional questions", () => {
      const questions = [
        { ...mockCheckboxQuestion, required: 1 },
        { ...mockLongTextQuestion, required: 0 },
      ];

      const result = mapStep2ToView(questions, undefined);

      expect(result[0]).toHaveProperty("required", true);
      expect(result[1]).toHaveProperty("required", false);
    });

    it("should set empty values array for unmapped checkbox", () => {
      const result = mapStep2ToView([mockCheckboxQuestion], undefined);
      const checkboxItem = result[0] as any;

      expect(checkboxItem.values).toEqual([]);
    });

    it("should set null value for unmapped long text", () => {
      const result = mapStep2ToView([mockLongTextQuestion], undefined);
      const longTextItem = result[0] as any;

      expect(longTextItem.value).toBeNull();
    });

    it("should handle detail as non-object", () => {
      const result1 = mapStep2ToView([mockCheckboxQuestion], "string");
      const result2 = mapStep2ToView([mockCheckboxQuestion], 123);

      expect(result1[0]).toBeDefined();
      expect(result2[0]).toBeDefined();
    });

    it("should process multiple questions in order", () => {
      const questions = [mockCheckboxQuestion, mockLongTextQuestion];
      const result = mapStep2ToView(questions, undefined);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id", 1);
      expect(result[1]).toHaveProperty("id", 2);
    });
  });
});
