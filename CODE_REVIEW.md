# 코드 리뷰 보고서

**리뷰 날짜**: 2025-11-23
**프로젝트**: EKEC Frontend
**리뷰어**: Claude Code Agent

---

## 📊 전체 개요

### 프로젝트 통계

- **총 파일 수**: 361개 (TypeScript/TSX)
- **총 코드 라인**: 26,286줄
- **기술 스택**: React 19, TypeScript 5.8, Vite 7, Zustand, React Query
- **코드 품질 점수**: 65/100

### 점수 세부 항목

| 항목 | 점수 | 설명 |
|------|------|------|
| 구조 | 75/100 | 전반적으로 잘 구조화되어 있으나, 일부 개선 필요 |
| 타입 안정성 | 55/100 | any 타입 남용으로 인한 낮은 점수 |
| 보안 | 45/100 | XSS 취약점 및 토큰 관리 문제 발견 |
| 성능 | 65/100 | 최적화 여지 있음 |
| 유지보수성 | 70/100 | 코드 중복 및 일관성 부족 |

---

## 🔴 Critical 이슈 (즉시 수정 필요)

### 1. 중복된 API 클라이언트

**심각도**: 🔴 Critical
**영향도**: High
**예상 작업 시간**: 4-6시간

**문제**:
- 3개의 서로 다른 API 클라이언트가 존재
- `apiClient.ts`, `axios.ts`, `client.ts`
- 인증 방식이 일관되지 않음 (쿠키 vs localStorage)

**파일**:
- `/src/apis/apiClient.ts`
- `/src/apis/axios.ts`
- `/src/apis/client.ts`

**해결 방안**:
```typescript
// 단일 API 클라이언트로 통합 (권장: axios 기반)
// src/apis/client.ts

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 쿠키 기반 인증
  timeout: 10000,
});

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  // XSRF 토큰 처리
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken;
  }

  return config;
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 처리
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. localStorage에 토큰 저장 (XSS 취약점)

**심각도**: 🔴 Critical
**영향도**: High
**예상 작업 시간**: 2-3시간

**문제**:
```typescript
// src/apis/client.ts:15-16
const token = localStorage.getItem("accessToken");
if (token) headers.set("Authorization", `Bearer ${token}`);

// src/apis/client.ts:68, 79
localStorage.setItem("accessToken", newToken);
```

**보안 위험**:
- XSS 공격 시 토큰 탈취 가능
- JavaScript로 접근 가능한 스토리지에 민감 정보 저장

**해결 방안**:
- HttpOnly 쿠키로 토큰 관리 (서버에서 설정)
- localStorage 방식 완전 제거
- 이미 쿠키 기반 인증이 구현되어 있으므로 통합

```typescript
// ❌ localStorage 사용 - 삭제 필요
localStorage.setItem("accessToken", token);

// ✅ HttpOnly 쿠키 사용 (서버에서 Set-Cookie 헤더로 설정)
// 클라이언트에서는 별도 처리 불필요
```

---

### 3. XSS 취약점 - dangerouslySetInnerHTML

**심각도**: 🔴 Critical
**영향도**: High
**예상 작업 시간**: 2-3시간

**문제 파일**:
- `/src/components/detail/notice/detail/NoticeAbout.tsx:11`
- `/src/components/detail/bulletin/detail/BulletinAbout.tsx:12`
- `/src/components/detail/Schedule/ScheduleNotice.tsx:9`
- `/src/components/detail/notice/detail/edit/EditContentInput.tsx:56`

**현재 코드**:
```typescript
<div
  className="tui-content ..."
  dangerouslySetInnerHTML={{ __html: content }}
/>
```

**해결 방안**:

1. **DOMPurify 설치**:
```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

2. **적용**:
```typescript
import DOMPurify from 'dompurify';

// 안전한 HTML 렌더링
<div
  className="tui-content ..."
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: ['class', 'id'],
    })
  }}
/>
```

3. **공통 컴포넌트 생성**:
```typescript
// src/components/common/SafeHtml.tsx
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export const SafeHtml = ({ html, className }: SafeHtmlProps) => {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['class', 'id'],
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};
```

---

### 4. any 타입 남용

**심각도**: 🔴 Critical
**영향도**: Medium
**예상 작업 시간**: 8-12시간

**문제**:
- 50개 파일에서 any 타입 사용
- 타입 안정성 상실
- IDE 자동완성 불가

**주요 사례**:
```typescript
// ❌ 나쁜 예
const transformUpdatedCommentData = (comment: any): any => ({ ... });

queryClient.setQueryData(
  ["bulletin", parseInt(crewId), parseInt(postId)],
  (old: any) => ({ ... })
);
```

**해결 방안**:
```typescript
// ✅ 좋은 예
interface Comment {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
}

const transformUpdatedCommentData = (comment: Comment): Comment => ({ ... });

queryClient.setQueryData<BulletinData>(
  ["bulletin", parseInt(crewId), parseInt(postId)],
  (old) => {
    if (!old) return old;
    return { ...old, ... };
  }
);
```

---

## 🟠 High 이슈 (단기 수정 권장)

### 1. console.log 다수 존재

**심각도**: 🟠 High
**파일**: 69개 파일, 216개 사용

**문제**:
```typescript
// apis/bulletins.ts
console.log("🚀 updateBulletinApi 호출:", { ... });
console.log("📷 기존 이미지 IDs:", data.existingImageIds);
```

**해결 방안**:

1. **환경별 로거 생성**:
```typescript
// src/utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
    // 프로덕션에서는 Sentry 등으로 전송
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
};
```

2. **사용**:
```typescript
import { logger } from '@/utils/logger';

// 개발 환경에서만 출력
logger.log("🚀 updateBulletinApi 호출:", data);
```

---

### 2. key={index} 안티패턴

**심각도**: 🟠 High
**파일**: 8개 파일

**문제**:
```typescript
// ❌ 나쁜 예
{crew.tags.map((tag, i) => (
  <div key={i}>#{tag}</div>
))}
```

**해결 방안**:
```typescript
// ✅ 좋은 예
{crew.tags.map((tag) => (
  <div key={tag}>#{tag}</div>
))}

// 또는 고유 ID가 있는 경우
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

---

### 3. 에러 핸들링 일관성 부족

**심각도**: 🟠 High

**문제**:
- alert() 사용
- window.confirm() 사용
- 조용한 에러 처리
- 일관되지 않은 에러 메시지

**해결 방안**:

1. **Toast 라이브러리 도입**:
```bash
pnpm add react-hot-toast
```

2. **전역 에러 핸들러**:
```typescript
// src/utils/errorHandler.ts
import toast from 'react-hot-toast';

export const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else if (error instanceof Error) {
    toast.error('오류가 발생했습니다.');
  } else {
    toast.error('알 수 없는 오류가 발생했습니다.');
  }
};
```

3. **Error Boundary**:
```typescript
// src/components/common/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Sentry에 에러 전송
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

### 4. 테스트 코드 부재

**심각도**: 🟠 High
**영향도**: High

**문제**:
- 테스트 파일 0개
- 리팩토링 시 안전성 없음
- 회귀 버그 발견 어려움

**해결 방안**:

1. **Vitest 설정**:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

2. **설정 파일**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

3. **예시 테스트**:
```typescript
// src/utils/__tests__/datetime.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../datetime';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('2025.01.15');
  });
});
```

---

## 🟡 Medium 이슈 (중기 개선)

### 1. 메모이제이션 부족

**개선 대상**:
- 리스트 아이템 컴포넌트
- 복잡한 계산이 있는 컴포넌트

**예시**:
```typescript
// ✅ React.memo 적용
export const CrewCard = React.memo(({ crew }: CrewCardProps) => {
  return (
    <div className="crew-card">
      {/* ... */}
    </div>
  );
});

// ✅ useMemo 적용
const filteredCrews = useMemo(() => {
  return crews.filter(crew => crew.category === selectedCategory);
}, [crews, selectedCategory]);
```

---

### 2. 중복 코드 제거

**문제**:
- 유사한 좋아요 로직 중복
- 비슷한 폼 검증 로직 중복

**해결**:
```typescript
// src/hooks/common/useLike.ts
export const useLike = (
  resourceType: 'bulletin' | 'schedule',
  crewId: string,
  postId: string
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleLikeApi(resourceType, crewId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries([resourceType, crewId, postId]);
    },
  });

  return mutation;
};
```

---

### 3. 깊은 import 경로

**문제**:
```typescript
import Header from "../../../components/detail/header";
```

**해결**:
```typescript
// tsconfig.app.json에 이미 설정되어 있음
import Header from "@/components/detail/header";
```

---

## 🟢 Low 이슈 (장기 개선)

### 1. TODO 주석

**파일**: `/src/components/auth/createProfile/phoneNumberForm.tsx:23-34`

```typescript
// TODO: 전화번호 인증 로직
// TODO: 인증번호 확인 로직
// TODO: 인증번호 재전송 로직
```

**권장**: GitHub Issue로 전환

---

### 2. 하드코딩된 값

**파일**: `/src/components/detail/bulletin/PostForm/PostBulletinForm.tsx:97, 122`

```typescript
// ❌ 기본값 1은 위험
const userId = user?.id || 1;

// ✅ 인증 필수 체크
if (!user?.id) {
  throw new Error('로그인이 필요합니다.');
}
const userId = user.id;
```

---

## 📋 개선 우선순위 로드맵

### Phase 1: 보안 강화 (1주)

- [ ] API 클라이언트 통합
- [ ] localStorage 토큰 제거
- [ ] DOMPurify 적용 (XSS 방어)
- [ ] 보안 취약점 점검

**예상 시간**: 1주
**담당**: 전체 팀

---

### Phase 2: 타입 안정성 (2주)

- [ ] any 타입 제거 (50개 파일)
- [ ] React Query 타입 강화
- [ ] 타입 가드 추가
- [ ] strict mode 준수

**예상 시간**: 2주
**담당**: 전체 팀

---

### Phase 3: 코드 품질 (2주)

- [ ] console.log 제거 및 로거 도입
- [ ] 에러 핸들링 표준화
- [ ] Toast 라이브러리 도입
- [ ] Error Boundary 구현
- [ ] key={index} 제거

**예상 시간**: 2주
**담당**: 전체 팀

---

### Phase 4: 테스트 & 성능 (2주)

- [ ] Vitest 설정
- [ ] 주요 유틸 함수 테스트
- [ ] React.memo 적용
- [ ] 이미지 lazy loading
- [ ] Code splitting

**예상 시간**: 2주
**담당**: 전체 팀

---

## 📌 권장 도구 및 라이브러리

### 보안
- **DOMPurify**: XSS 방어
- **helmet** (서버 측): HTTP 헤더 보안

### 에러 처리
- **react-hot-toast**: Toast 알림
- **Sentry**: 에러 모니터링

### 테스트
- **Vitest**: 테스트 러너
- **@testing-library/react**: React 컴포넌트 테스트
- **MSW**: API 모킹

### 성능
- **React DevTools**: 성능 프로파일링
- **Lighthouse**: 웹 성능 측정

---

## 🎯 결론

### 강점
- ✅ 최신 기술 스택 사용
- ✅ 잘 구조화된 프로젝트
- ✅ React Query를 통한 효율적인 상태 관리
- ✅ TypeScript strict mode 활성화

### 개선 필요 영역
- ❌ 보안 취약점 (XSS, 토큰 관리)
- ❌ any 타입 남용
- ❌ 테스트 부재
- ❌ 일관되지 않은 에러 핸들링

### 최우선 작업
1. **보안 이슈 해결** (Critical)
2. **타입 안정성 강화** (Critical)
3. **테스트 인프라 구축** (High)
4. **에러 핸들링 표준화** (High)

---

**리뷰 완료일**: 2025-11-23
**다음 리뷰 권장일**: 2025-12-23 (1개월 후)
