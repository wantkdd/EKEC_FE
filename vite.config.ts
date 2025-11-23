import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    // 프로덕션에서 console, debugger 제거
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // 상태 관리 라이브러리
          'state-vendor': ['zustand', '@tanstack/react-query', '@tanstack/react-query-devtools'],

          // UI 라이브러리
          'ui-vendor': ['@headlessui/react', 'framer-motion', 'react-hot-toast'],

          // 폼 관련
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // 에디터
          'editor-vendor': ['@toast-ui/editor'],
        },
      },
    },
    // 청크 크기 경고 임계값 상향 (일시적)
    chunkSizeWarningLimit: 600,

    // 소스맵 비활성화 (프로덕션)
    sourcemap: false,

    // CSS 코드 스플리팅
    cssCodeSplit: true,

    // 최소화 옵션 (esbuild 사용)
    minify: 'esbuild',
    target: 'es2020',
  },

  // 최적화 설정
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
    ],
  },
});
