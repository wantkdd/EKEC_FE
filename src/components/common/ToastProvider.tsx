/**
 * Toast 알림 Provider
 *
 * react-hot-toast의 Toaster 컴포넌트를 제공합니다.
 * App.tsx에서 이 컴포넌트를 최상위에 배치하여 사용합니다.
 */

import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // 기본 옵션
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "8px",
          padding: "12px 20px",
        },
        // 성공
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        // 에러
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
        // 로딩
        loading: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};
