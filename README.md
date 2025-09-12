# EKEC 성향 맞춤 플랫폼 

🔗 서비스 링크 : https://ekec.site/

<img width="480" height="270" alt="ekec 소개 화면" src="https://github.com/user-attachments/assets/6d370458-db5b-4c55-bdb3-a0d8bb19f4e4" />

## 프로젝트 소개
이크에크(EKEC)는 개인의 성향에 꼭 맞는 모임을 찾아주는 매칭 플랫폼 입니다.
성향 맞춤 필터링으로 나와 잘 맞는 모임을 찾을 수 있고,
리뷰 시스템과 활발한 활동 공유를 통해 모임의 분위기를 미리 파악하여 참여할 수 있는 커뮤니티 서비스 입니다.

## 프로젝트 개발 기간
2025.06.26 ~ 2025.08.23

## 👥 Web Developers

| <img src="https://avatars.githubusercontent.com/u/158552165" width=100> | <img src="https://avatars.githubusercontent.com/u/160628390?s=96&v=4" width=100> | <img src="https://avatars.githubusercontent.com/u/163666284?s=96&v=4" width=100> |<img src="https://avatars.githubusercontent.com/u/202471958?s=96&v=4" width=100> |
| :---: | :---: | :---: | :---: |
| [김정현](https://github.com/hyeeon) | [임혜미](https://github.com/wendy0802) | [유상완](https://github.com/wantkdd) | [정동열](https://github.com/dongyeol02) |

### 개발 환경

 <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white"/>
 
### 🌐 Git-flow

- main: 프로젝트가 최종적으로 배포되는 브랜치
- develop: 다음 출시 버전을 개발하는 브랜치
- feature: 기능을 개발하는 브랜치

### 📌 Git branch 규칙

- 개인 작업은 꼭 feature 브랜치에서 하기
- 모든 작업 시작 전 develop에서 pull을 받은 후, feature 브랜치에서 작업 시작
- 개인 작업 마치면 feature 브랜치로 pull request를 통해 develop에 merge하기
- 프로젝트 완료 후 main으로 merge(main에 pr 올리지 말고 접근하지 말기!!)

### 📝 Feature branch

- 브랜치명은 아래의 형식으로 작성합니다. (feature/이름-기능제목#이슈번호)

- 팀원 wantkdd의 브랜치명: feature/wantkdd-login#1
- Feature branch -> develop branch로 merge하기 전 PR에서 reviewers 설정하여 팀원 1명 이상에게 approve 받기

- PR 후 팀원들에게 공지하기

### 🎯 Commit Convention

- 커밋 메시지의 형식은 하단의 사진과 같이 통일해 주세요.

- 🎉 Start: Start New Project
- ✨ Feat: 새로운 기능을 추가
- 🐛 Fix: 버그 수정
- 🎨 Design: CSS 등 사용자 UI 디자인 변경
- ♻️ Refactor: 코드 리팩토링
- 🔧 Settings: Changing configuration files
- 🗃️ Comment: 필요한 주석 추가 및 변경
- ➕ Dependency/Plugin: Add a dependency/plugin
- 📝 Docs: 문서 수정
- 🔀 Merge: Merge branches
- 🚀 Deploy: Deploying stuff
- 🚚 Rename: 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
- 🔥 Remove: 파일을 삭제하는 작업만 수행한 경우
- ⏪️ Revert: 전 버전으로 롤백
