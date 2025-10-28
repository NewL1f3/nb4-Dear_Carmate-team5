# Dear Carmate

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&height=200&color=ffffff&text=Dear%20Carmate%20&fontSize=100&textBg=false&descSize=20&animation=twinkling&fontAlign=50&fontColor=000000&desc=중고차%20계약의%20모든%20것을%20한%20곳에!&descAlignY=85&descAlign=50">
<p/>

---

# Dear Carmate - team5

## 👨‍👩‍👧‍👦 팀원

### Team

| <img src="https://github.com/joyy303.png" width="150" height="150"/> | <img src="https://github.com/Batur-s.png" width="150" height="150"/> | <img src="https://github.com/Park-DaSeul.png" width="150" height="150"/> | <img src="https://github.com/NewL1f3.png" width="150" height="150"/> | <img src="https://github.com/proteiin.png" width="150" height="150"/> | <img src="https://github.com/winnie4869.png" width="150" height="150"/> |
| :------------------------------------------------------------------: | :------------------------------------------------------------------: | :----------------------------------------------------------------------: | :------------------------------------------------------------------: | :-------------------------------------------------------------------: | :---------------------------------------------------------------------: |
|         최은영<br>[@joyy303](https://github.com/Park-DaSeul)         |           신경렬<br>[@Batur-s](https://github.com/Batur-s)           |         박다슬<br>[@Park-DaSeul](https://github.com/Park-DaSeul)         |          이상욱<br>[@NewL1f3](https://github.com/GithubID4)          |          손준영<br>[@proteiin](https://github.com/GithubID5)          |          이하영<br>[@winnie4869](https://github.com/GithubID6)          |
|                             기획, 백엔드                             |                             기획, 백엔드                             |                               기획, 백엔드                               |                             기획, 백엔드                             |                             기획, 백엔드                              |                              기획, 백엔드                               |

## 1. 프로젝트 소개

- Dear Carmate는 중고차 딜러들의 효율적인 고객 및 차량 관리를 돕는 CRM 서비스입니다.
- 프로젝트 기간 : 2025.09.30 ~ 2025.10.28

## 2. 주요 기능

- **고객 관리**: 신규 고객 등록, 정보 수정, 삭제 및 계약 이력 조회를 할 수 있습니다.
- **차량 관리**: 판매 차량 등록, 정보 수정, 삭제 및 상태(보유, 계약 진행, 계약 완료) 변경이 가능합니다.
- **계약 관리**: 고객과 차량을 연결하여 계약을 생성하고, 계약 진행 상태(차량 확인, 가격 협의, 계약서 작성 중, 계약 성공, 계약 실패)를 추적합니다.
- **문서 관리**: 계약 관련 문서를 업로드 및 다운로드할 수 있으며, 계약서를 업로드하면 고객에게 이메일로 자동 발송됩니다.
- **대시보드**: 월별 계약 수, 차량 판매 현황 등 주요 지표를 시각적으로 확인할 수 있습니다.
- **사용자 관리**: 관리자(admin)와 일반 사용자(user) 권한을 분리하여 회사별로 사용자를 관리합니다.
- **대용량 업로드**: 고객 및 차량 데이터를 CSV 파일로 한 번에 업로드할 수 있어 대량 데이터 등록이 용이합니다.

## 3. 기술 스택

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma (ORM)
- **Authentication**: JWT (Access Token, Refresh Token)
- **File Handling**: Cloudinary, Busboy
- **Validation**: Zod
- **Scheduling**: node-cron
- **Email**: SendGrid
- **Environment Variables**: dotenv

## 4. 팀원별 구현 기능 상세

### 최은영

<details>
<summary>구현 내용 정리</summary>

<br> <br/>

</details>

### 신경렬

<details>
<summary>구현 내용 정리</summary>

<br> <br/>

</details>

### 박다슬

<details>
<summary>구현 내용 정리</summary>

<br> <br/>

- **계약서 업로드 API**
  - 계약서 목록, 상세 조회 기능 구현
  - 계약서 업로드, 다운로드 기능 구현
  - 계약서 업로드 시 고객 email로 계약서 자동 발송 기능 구현
- **이미지 업로드 API**
  - 사용자 프로필 이미지 기능 구현
- **미들웨어 작성**
  - error-handler.ts → 전역 에러 핸들러 작성 및 각 라우터 적용
  - async-handler.ts → 비동기 함수의 에러 처리를 위한 래퍼 함수 구현
  - cloudinary-upload-middleware.ts → Cloudinary를 통한 이미지 및 문서 업로드/다운로드 기능 구현
  - validate-middleware.ts → Zod를 활용한 요청 데이터 유효성 검사 구현
- **lib 함수 작성**
  - cron-jobs.ts → 업로드된 문서 및 이미지 중 더미 파일을 정기적으로 삭제하는 스케줄러 구현
  - email-service.ts → SendGrid 기반의 이메일 발송 서비스 유틸 함수 구현
- **DB 스키마 설계**
  - 팀원들과 공동 작업
  - 계약서 테이블 설계
- **프로젝트 안정화 및 성능 테스트**
  - k6를 이용한 부하 테스트 진행
  - Render 무료 플랜 환경에서 VU 15명 기준, p(95) = 452.74ms, 에러율 0% 결과 확인
- **프로젝트 배포**
  - 배포용 브랜치 관리 및 배포 자동화 프로세스 구축
  - Render(백엔드 및 데이터베이스), Vercel(프론트엔드)로 배포 진행

  ![k6 테스트 결과](https://github.com/user-attachments/assets/43d4eb89-ee8c-4274-bdfa-862c2db2484b)

</details>

### 이상욱

<details>
<summary>구현 내용 정리</summary>

<br> <br/>

-차량 시드 제작
<img width="948" height="342" alt="차량시드1" src="https://github.com/user-attachments/assets/8df91595-902b-402e-9cb5-0bb3a4d2c4a5" />
<img width="1163" height="822" alt="차량시드" src="https://github.com/user-attachments/assets/84b870aa-baba-4bb6-aefa-e43ee1a69211" />

-차량 생성

![차량생성](https://github.com/user-attachments/assets/2fec19fe-0fbd-4e3e-8962-bc7a2483daa8)

-차량 수정 상세 조회

![차량정보수정상세조회](https://github.com/user-attachments/assets/52290675-8070-47bc-bda7-4018abf2b7ec)

-차량 삭제

![차량삭제](https://github.com/user-attachments/assets/e5112a1e-2640-4ba9-8b38-6f40068463ae)

-차량 업로드 에러 처리

![차량등록에러처리](https://github.com/user-attachments/assets/d791f01d-a403-4e7c-8ff9-c502912fa9d9)

-대용량 차량 업로드

![대용량차량등록](https://github.com/user-attachments/assets/cb2f8584-7652-4a0f-965b-f6adaf7d4480)

-대용량 차량 업로드 에러 처리

![대용량업로드에러처리](https://github.com/user-attachments/assets/8767ae3b-2ccc-4332-9b80-a4bc4b3398a1)

-ERD 이미지 제작
<img width="1043" height="1288" alt="화면 캡처 2025-10-01 190415" src="https://github.com/user-attachments/assets/f6690126-243c-4267-b7b6-2ec119dd6b2c" />
<img width="1333" height="1002" alt="Untitled (4)" src="https://github.com/user-attachments/assets/dbf61eeb-01fa-403f-a9cb-dc304173ac0d" />

-TSCONFIG 기초틀 제시
<img width="935" height="653" alt="화면 캡처 2025-10-28 143354" src="https://github.com/user-attachments/assets/9618345d-b944-4e90-a152-30e32fd861d3" />

</details>

### 손준영

<details>
<summary>구현 내용 정리</summary>

<br> <br/>

</details>

### 이하영

<details>
<summary>구현 내용 정리</summary>

<br> <br/>

### **1.  백엔드 시스템 설계 및 구축**

- Express 기반 RESTful API 서버를 구축하며, Service·Controller·Repository 3계층 구조로 리팩토링하여 유지보수성과 가독성을 향상시키고, `auth-middleware.ts`를 통해 JWT 기반 사용자 인증 및 권한 검증 로직을 구현함.

### **2.  회원 관리 기능 구현**

- 회원가입, 로그인, 내 정보 조회·수정·탈퇴 기능을 개발하고, `bcrypt`를 통한 비밀번호 암호화 및 검증 로직과 Prisma ORM 기반의 안전한 DB 접근 및 예외 처리를 구현하였으며, 각 API 요청별 HTTP 상태 코드와 오류 메시지를 세분화·표준화함.

### **3. 관리자(Admin) 기능 구현**

- 관리자만 접근 가능한 `/users/:id DELETE` 유저 삭제 API를 개발하고, 삭제 시 기업(`Company`) 테이블의 인원 수(`userCount`)를 자동 감소시키는 트랜잭션 로직과 `userInfo.isAdmin`을 통한 관리자 권한 검증 기능을 구현함.

### **4. 데이터베이스 설계 및 연동**

- Prisma ORM을 활용하여 `User`, `Company`, `Car` 테이블 간 관계를 설정하고, 회사 인증 시 `companyName`과 `companyCode` 매칭 검증 로직을 구현하였으며, `$transaction`을 통해 데이터 무결성을 보장함.

### **5. API 테스트 및 협업 지원**

- Postman을 활용해 API 통신 테스트 및 프론트엔드 팀과의 연동을 확인하고, 공통 JSON 응답 형식을 정의하여 협업 효율성을 높였으며, 회원가입 시 회사 등록 → 유저 등록 → 회사 인원 수 증가로 이어지는 전체 플로우를 완성함.

</details>

## 5. 시작하기

### 5.1. 설치

1.  저장소를 클론합니다.
    ```bash
    git clone https://github.com/your-repository/nb4-Dear_Carmate-team5.git
    ```
2.  프로젝트 디렉토리로 이동합니다.
    ```bash
    cd nb4-Dear_Carmate-team5
    ```
3.  의존성을 설치합니다.
    ```bash
    npm install
    ```

### 5.2. 환경 변수 설정

`.env.sample` 파일을 복사하여 `.env` 파일을 생성하고, 아래 환경 변수를 설정합니다.

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# SendGrid
SENDGRID_API_KEY="your_sendgrid_api_key"
SENDGRID_SENDER_EMAIL="your_sender_email"

# CORS
CORS_ORIGIN="http://localhost:3000"

# PORT
PORT=3001
```

### 5.3. 데이터베이스 마이그레이션

Prisma를 사용하여 데이터베이스를 마이그레이션합니다.

```bash
npx prisma migrate dev
```

### 5.4. 실행

개발 서버를 시작합니다.

```bash
npm run dev
```

## 6. 폴더 구조

```
nb4-Dear_Carmate-team5/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── lib/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── cars/
│   │   ├── company/
│   │   ├── contract-documents/
│   │   ├── contracts/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── images/
│   │   └── user/
│   ├── types/
│   └── utils/
├── .env.sample
├── .gitignore
├── package.json
└── tsconfig.json
```

## 7. API 엔드포인트

### Auth

- `POST /auth/login`: 로그인
- `POST /auth/refresh`: Access Token 재발급

### User

- `POST /users`: 신규 직원(사용자) 등록 (관리자용)
- `GET /users/me`: 내 정보 조회
- `PATCH /users/me`: 내 정보 수정
- `DELETE /users/me`: 회원 탈퇴
- `DELETE /users/:userId`: 특정 사용자 삭제 (관리자용)

### Company

- `POST /companies`: 회사 및 관리자 계정 생성 (회원가입)
- `GET /companies`: 회사 목록 조회
- `GET /companies/users`: 소속 직원 목록 조회
- `PATCH /companies/:companyId`: 회사 정보 수정
- `DELETE /companies/:companyId`: 회사 삭제

### Customer

- `POST /customers`: 신규 고객 추가
- `GET /customers`: 고객 목록 조회
- `GET /customers/:customerId`: 특정 고객 상세 조회
- `PATCH /customers/:customerId`: 고객 정보 수정
- `DELETE /customers/:customerId`: 고객 정보 삭제
- `POST /customers/upload`: CSV 파일로 고객 대량 등록

### Car

- `POST /cars`: 신규 차량 추가
- `GET /cars`: 차량 목록 조회
- `GET /cars/models`: 차량 모델 목록 조회
- `GET /cars/:carId`: 특정 차량 상세 조회
- `PATCH /cars/:carId`: 차량 정보 수정
- `DELETE /cars/:carId`: 차량 정보 삭제
- `POST /cars/upload`: CSV 파일로 차량 대량 등록

### Contract

- `POST /contracts`: 신규 계약 생성
- `GET /contracts`: 계약 목록 조회
- `PATCH /contracts/:id`: 계약 정보 수정
- `DELETE /contracts/:id`: 계약 삭제
- `GET /contracts/cars`: 계약 생성을 위한 차량 정보 조회
- `GET /contracts/customers`: 계약 생각을 위한 고객 정보 조회
- `GET /contracts/users`: 계약 생성을 위한 직원 정보 조회

### Contract Document

- `POST /contractDocuments/upload`: 계약 문서 업로드
- `GET /contractDocuments`: 계약 문서 목록 조회
- `GET /contractDocuments/draft`: 문서 추가를 위한 계약 목록 조회
- `GET /contractDocuments/:id/download`: 계약 문서 다운로드

### Image

- `POST /images/upload`: 사용자 프로필 이미지 업로드

### Dashboard

- `GET /dashboard`: 대시보드 데이터 조회

## 8. 데이터베이스 스키마

- **Company**: 회사 정보
- **User**: 사용자(직원) 정보
- **Customer**: 고객 정보
- **Manufacturer**: 자동차 제조사
- **Model**: 자동차 모델
- **Car**: 차량 정보
- **Contract**: 계약 정보
- **Meeting**: 미팅 정보
- **ContractDocument**: 계약 문서 정보
- **Image**: 사용자 프로필 이미지 정보

## 9. 주요 스크립트

- `npm run dev`: 개발 서버 실행 (ts-node)
- `npm run build`: TypeScript 컴파일
- `npm run start`: 컴파일된 JavaScript 파일로 서버 실행
- `npm run format`: Prettier를 사용하여 코드 포맷팅
- `npx prisma migrate dev`: 데이터베이스 마이그레이션
- `npx prisma studio`: Prisma Studio 실행
- `npx prisma db seed`: Seed 데이터 추가

## 10. 배포 홈페이지

https://nb04-dear-carmate-team5-front.vercel.app/
