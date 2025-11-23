/**
 * Toast 유틸리티
 * alert/confirm 대체용
 */

import toast from 'react-hot-toast';

/**
 * 성공 메시지
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
  });
};

/**
 * 에러 메시지
 */
export const showError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
  });
};

/**
 * 정보 메시지
 */
export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
    icon: 'ℹ️',
  });
};

/**
 * 경고 메시지
 */
export const showWarning = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
    icon: '⚠️',
  });
};

/**
 * confirm 대체
 * Promise를 반환하여 사용자 확인을 기다림
 */
export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};

/**
 * 로딩 상태 Toast
 */
export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
  });
};

/**
 * Toast 닫기
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};
