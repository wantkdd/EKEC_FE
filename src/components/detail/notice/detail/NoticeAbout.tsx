import React from "react";
import { SafeHtml } from "../../../common/SafeHtml";

export type NoticeAboutProps = {
  content: string;
};

const NoticeAbout: React.FC<NoticeAboutProps> = ({ content }) => {
  return (
    <SafeHtml
      html={content}
      className="tui-content rounded-2xl bg-gray-50 ring-gray-50 shadow-sm ring-1 p-4 sm:p-6 lg:p-8"
    />
  );
};

export default NoticeAbout;
