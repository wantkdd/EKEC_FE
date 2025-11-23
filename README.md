# EKEC 성향 맞춤 플랫폼

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ekec.site/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<img width="480" height="270" alt="ekec 소개 화면" src="https://github.com/user-attachments/assets/6d370458-db5b-4c55-bdb3-a0d8bb19f4e4" />

## 📖 프로젝트 소개

**이크에크(EKEC)** 는 개인의 성향에 꼭 맞는 모임을 찾아주는 매칭 플랫폼입니다.

### 주요 기능

- 🎯 **성향 맞춤 필터링**: 나와 잘 맞는 모임을 정확하게 찾을 수 있습니다
- ⭐ **리뷰 시스템**: 실제 참여자들의 생생한 리뷰를 확인할 수 있습니다
- 📢 **활동 공유**: 모임의 활동을 미리 파악하고 참여를 결정할 수 있습니다
- 💬 **실시간 소통**: 모임원들과 자유롭게 소통할 수 있습니다

### 개발 기간
2025.06.26 ~ 2025.08.23

---

## 👥 개발팀

| <img src="https://avatars.githubusercontent.com/u/158552165" width=100> | <img src="https://avatars.githubusercontent.com/u/160628390?s=96&v=4" width=100> | <img src="https://avatars.githubusercontent.com/u/163666284?s=96&v=4" width=100> |<img src="https://avatars.githubusercontent.com/u/202471958?s=96&v=4" width=100> |
| :---: | :---: | :---: | :---: |
| [김정현](https://github.com/hyeeon) | [임혜미](https://github.com/wendy0802) | [유상완](https://github.com/wantkdd) | [정동열](https://github.com/dongyeol02) |

---

## 🛠️ 기술 스택

### Frontend Core
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### 상태 관리 & 데이터 페칭
![React Query](https://img.shields.io/badge/React_Query-5.81.5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0.6-000000?style=for-the-badge)

### 스타일링
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.1-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### 폼 & 검증
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.60.0-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3.25.74-3E67B1?style=for-the-badge)

### HTTP 클라이언트
![Axios](https://img.shields.io/badge/Axios-1.10.0-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### 기타
- **라우팅**: React Router v7.6.3
- **날짜 처리**: Day.js 1.11.13
- **에디터**: Toast UI Editor 3.2.2
- **폰트**: Pretendard

---

## 📁 프로젝트 구조

```
src/
├── apis/              # API 클라이언트 및 엔드포인트
│   ├── apiClient.ts   # Axios 인스턴스 설정
│   ├── auth.ts        # 인증 관련 API
│   ├── bulletins.ts   # 게시판 API
│   └── ...
├── components/        # React 컴포넌트 (도메인별 구분)
│   ├── auth/          # 인증 관련 컴포넌트
│   ├── detail/        # 상세 페이지 컴포넌트
│   ├── homepage/      # 홈페이지 컴포넌트
│   └── ...
├── hooks/             # 커스텀 훅
│   ├── auth/          # 인증 관련 훅
│   ├── bulletin/      # 게시판 관련 훅
│   └── ...
├── pages/             # 페이지 컴포넌트
├── routes/            # 라우팅 설정
├── store/             # Zustand 전역 상태 관리
│   ├── useAuthStore.ts
│   └── categoryStore.ts
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
├── schemas/           # Zod 스키마 (폼 검증)
├── constants/         # 상수
├── assets/            # 정적 리소스 (이미지, 아이콘)
├── layout/            # 레이아웃 컴포넌트
└── styles/            # 전역 CSS 스타일
```

---

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- pnpm 8.x 이상

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/EKEC-crew/FE.git
cd FE
```

2. **의존성 설치**
```bash
pnpm install
```

3. **환경 변수 설정**
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

4. **개발 서버 실행**
```bash
pnpm dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview

# 린트 검사
pnpm lint
```

---

## 📂 주요 파일 설명

- `vite.config.ts` - Vite 번들러 설정
- `tsconfig.json` - TypeScript 설정
- `tsconfig.app.json` - 애플리케이션 TypeScript 설정 (경로 별칭 포함)
- `eslint.config.js` - ESLint 규칙
- `.prettierrc` - Prettier 코드 포맷팅 규칙
- `netlify.toml` - Netlify 배포 설정

---

## 🌿 Git 워크플로우

### Git-Flow 전략

```
main (프로덕션 배포)
  ↑
develop (개발 통합)
  ↑
feature/* (기능 개발)
```

#### 브랜치 종류

| 브랜치 | 설명 | 네이밍 규칙 |
|--------|------|-------------|
| `main` | 프로덕션 배포 브랜치 | `main` |
| `develop` | 개발 통합 브랜치 | `develop` |
| `feature/*` | 기능 개발 브랜치 | `feature/이름-기능제목#이슈번호` |

#### 작업 흐름

1. **작업 시작 전**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/username-feature-name#123
   ```

2. **작업 완료 후**
   ```bash
   git add .
   git commit -m "✨ Feat: 새로운 기능 추가"
   git push origin feature/username-feature-name#123
   ```

3. **Pull Request 생성**
   - Base: `develop` ← Compare: `feature/username-feature-name#123`
   - Reviewers 지정 (최소 1명 이상)
   - Approve 받은 후 merge
   - 팀원들에게 PR 공지

4. **주의사항**
   - ⚠️ `main` 브랜치에 직접 push 금지
   - ⚠️ PR 없이 `develop`에 직접 merge 금지
   - ✅ Approve 받은 후에만 merge

---

## 📝 커밋 컨벤션

### 커밋 메시지 형식

```
<타입>: <제목>

[본문 (선택사항)]

[꼬리말 (선택사항)]
```

### 타입 종류

| 이모지 | 타입 | 설명 |
|--------|------|------|
| 🎉 | Start | 프로젝트 시작 |
| ✨ | Feat | 새로운 기능 추가 |
| 🐛 | Fix | 버그 수정 |
| 🎨 | Design | CSS 등 사용자 UI 디자인 변경 |
| ♻️ | Refactor | 코드 리팩토링 (기능 변경 없음) |
| 🔧 | Settings | 설정 파일 변경 |
| 🗃️ | Comment | 주석 추가 및 변경 |
| ➕ | Dependency | 의존성 또는 플러그인 추가 |
| 📝 | Docs | 문서 수정 |
| 🔀 | Merge | 브랜치 병합 |
| 🚀 | Deploy | 배포 |
| 🚚 | Rename | 파일/폴더명 수정 또는 이동 |
| 🔥 | Remove | 파일 삭제 |
| ⏪️ | Revert | 이전 커밋으로 되돌리기 |

### 커밋 예시

```bash
# 좋은 예
✨ Feat: 사용자 프로필 편집 기능 추가

# 나쁜 예 (타입 없음, 설명 부족)
사용자 기능
```

---

## 🤝 기여 가이드

프로젝트에 기여하고 싶으시다면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시다면 이슈를 등록해주세요.

- 📧 이슈: [GitHub Issues](https://github.com/EKEC-crew/FE/issues)
- 🌐 웹사이트: https://ekec.site/
