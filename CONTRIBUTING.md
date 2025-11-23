# 기여 가이드 (Contributing Guide)

EKEC 프로젝트에 관심을 가져주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 환경 설정](#개발-환경-설정)
- [코드 작성 가이드라인](#코드-작성-가이드라인)
- [Pull Request 프로세스](#pull-request-프로세스)
- [이슈 리포팅](#이슈-리포팅)
- [커밋 메시지 가이드](#커밋-메시지-가이드)

---

## 행동 강령

이 프로젝트에 참여하는 모든 참여자는 다음의 행동 강령을 준수해야 합니다:

- 존중과 배려: 모든 기여자를 존중하고 건설적인 피드백을 제공합니다
- 협력적 태도: 팀원들과 적극적으로 소통하고 협력합니다
- 전문성: 코드 리뷰에서 기술적 논의에 집중합니다

---

## 시작하기

### 1. 저장소 Fork 및 Clone

```bash
# 1. GitHub에서 저장소를 Fork합니다

# 2. Fork한 저장소를 로컬에 Clone
git clone https://github.com/YOUR_USERNAME/FE.git
cd FE

# 3. upstream 원격 저장소 추가
git remote add upstream https://github.com/EKEC-crew/FE.git
```

### 2. 최신 코드 동기화

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
```

---

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: 18.x 이상
- **pnpm**: 8.x 이상
- **Git**: 2.x 이상

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 린트 체크
pnpm lint
```

### 권장 개발 도구

- **IDE**: VS Code
- **VS Code 확장**:
  - ESLint
  - Prettier - Code formatter
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense

---

## 코드 작성 가이드라인

### TypeScript

#### ✅ 좋은 예

```typescript
// 명확한 타입 정의
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}
```

#### ❌ 나쁜 예

```typescript
// any 타입 사용
function getUser(id: any): Promise<any> {
  return apiClient.get(`/users/${id}`);
}
```

### React 컴포넌트

#### ✅ 좋은 예

```typescript
// 명확한 Props 타입, 함수형 컴포넌트
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ text, onClick, variant = 'primary' }: ButtonProps) => {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {text}
    </button>
  );
};
```

#### ❌ 나쁜 예

```typescript
// Props 타입 없음, 인라인 스타일
export const Button = (props: any) => {
  return (
    <button style={{ color: 'blue' }} onClick={props.onClick}>
      {props.text}
    </button>
  );
};
```

### 상태 관리

- **전역 상태**: Zustand 사용 (최소한으로)
- **서버 상태**: React Query 사용
- **로컬 상태**: useState, useReducer 사용

```typescript
// React Query 사용 예시
export const useCrewList = (filters: CrewFilters) => {
  return useQuery({
    queryKey: ['crews', filters],
    queryFn: () => fetchCrews(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
```

### 스타일링

- **Tailwind CSS** 우선 사용
- 복잡한 스타일은 별도 CSS 파일로 분리
- 인라인 스타일은 동적 스타일에만 사용

```typescript
// ✅ 좋은 예 - Tailwind CSS
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  {children}
</div>

// ❌ 나쁜 예 - 인라인 스타일
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
  {children}
</div>
```

### 파일 구조

```
src/
├── components/
│   └── domain/           # 도메인별 구분
│       ├── ComponentName.tsx
│       └── index.ts      # re-export
├── hooks/
│   └── useSomething.ts   # use 접두사
├── utils/
│   └── helpers.ts        # 순수 함수
└── types/
    └── models.ts         # 타입 정의
```

### 네이밍 컨벤션

| 종류 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `UserProfile.tsx` |
| 훅 | use + PascalCase | `useAuth.ts` |
| 유틸 함수 | camelCase | `formatDate.ts` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 타입/인터페이스 | PascalCase | `UserData` |

### 코드 품질

#### 필수 준수 사항

- ✅ ESLint 경고 없이 통과
- ✅ Prettier로 포맷팅
- ✅ TypeScript strict mode 통과
- ✅ any 타입 사용 금지 (불가피한 경우 주석으로 이유 설명)
- ✅ console.log 제거 (디버깅 후)

#### 권장 사항

- 함수는 한 가지 일만 수행
- 함수는 20줄 이내 권장
- 중복 코드는 공통 함수로 추출
- 복잡한 로직에는 주석 추가

---

## Pull Request 프로세스

### 1. 브랜치 생성

```bash
# develop 브랜치에서 최신 코드 받기
git checkout develop
git pull upstream develop

# 새 기능 브랜치 생성
git checkout -b feature/username-feature-name#123
```

### 2. 작업 진행

```bash
# 코드 작성
# ...

# 변경사항 확인
git status
git diff

# 커밋
git add .
git commit -m "✨ Feat: 새로운 기능 추가"
```

### 3. Push 및 PR 생성

```bash
# Fork한 저장소에 Push
git push origin feature/username-feature-name#123
```

GitHub에서 Pull Request 생성:
- **Base**: `EKEC-crew/FE`의 `develop`
- **Compare**: `YOUR_USERNAME/FE`의 `feature/username-feature-name#123`

### 4. PR 템플릿 작성

```markdown
## 변경 사항
- 구현한 기능이나 수정 사항을 간략히 설명

## 관련 이슈
- Closes #123

## 체크리스트
- [ ] 코드가 ESLint 규칙을 통과합니다
- [ ] TypeScript 타입 에러가 없습니다
- [ ] 테스트를 작성했습니다 (해당하는 경우)
- [ ] 문서를 업데이트했습니다 (해당하는 경우)

## 스크린샷 (UI 변경 시)
[스크린샷 첨부]
```

### 5. 코드 리뷰

- 최소 1명 이상의 Approve 필요
- 리뷰어의 피드백에 성실히 응답
- 요청된 변경사항 반영

### 6. Merge

- Approve를 받으면 Squash and Merge
- 브랜치 삭제

---

## 이슈 리포팅

### 버그 리포트

버그를 발견하셨나요? 다음 정보를 포함해 이슈를 등록해주세요:

```markdown
## 버그 설명
버그에 대한 명확하고 간결한 설명

## 재현 방법
1. '...'로 이동
2. '...'을 클릭
3. 스크롤을 내려서 '...'로 이동
4. 에러 발생

## 예상 동작
어떻게 동작해야 하는지 설명

## 실제 동작
실제로 어떻게 동작하는지 설명

## 스크린샷
해당하는 경우 스크린샷 첨부

## 환경
- OS: [예: Windows 10]
- 브라우저: [예: Chrome 119]
- 버전: [예: 1.0.0]
```

### 기능 제안

새로운 기능을 제안하고 싶으신가요?

```markdown
## 기능 설명
제안하는 기능에 대한 명확하고 간결한 설명

## 동기
이 기능이 왜 필요한지 설명

## 대안
고려한 대안이 있다면 설명

## 추가 컨텍스트
기타 추가 정보
```

---

## 커밋 메시지 가이드

### 형식

```
<타입>: <제목>

<본문 (선택사항)>

<꼬리말 (선택사항)>
```

### 타입

- `✨ Feat`: 새로운 기능
- `🐛 Fix`: 버그 수정
- `📝 Docs`: 문서 변경
- `🎨 Design`: UI/UX 변경
- `♻️ Refactor`: 리팩토링
- `🔧 Settings`: 설정 변경
- `✅ Test`: 테스트 추가/수정

### 예시

```bash
# 좋은 예
git commit -m "✨ Feat: 사용자 프로필 편집 기능 추가

- 프로필 이미지 업로드 기능
- 닉네임 변경 기능
- 소개글 수정 기능

Closes #42"

# 나쁜 예
git commit -m "수정"
git commit -m "bug fix"
git commit -m "asdfasdf"
```

---

## 질문이 있으신가요?

- 📧 [GitHub Issues](https://github.com/EKEC-crew/FE/issues)에 질문을 등록해주세요
- 💬 [GitHub Discussions](https://github.com/EKEC-crew/FE/discussions)에서 논의할 수 있습니다

---

**감사합니다! 🎉**

여러분의 기여가 EKEC를 더 나은 서비스로 만듭니다.
