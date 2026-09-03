## Intro

리액트 + 타입스크립트로 만든 올리브영 클론 페이지 **올리브샵**입니다.

상품 조회부터 장바구니, 주문/결제, 리뷰까지 구매 흐름을 직접 구현했고  
DB는 SQL로 다루고 싶어서 Supabase를 사용했습니다.

배포: [Vercel](https://vercel.app)

---

## Skills

- **React + TypeScript**  
  공통 UI 컴포넌트와 페이지를 분리해 재사용성을 높이고, 타입으로 props/폼 데이터 안정성을 맞춤

- **React Query**  
  서버 상태와 UI 상태를 분리하고, 상품·장바구니 등 API 응답 캐싱에 활용

- **Redux Toolkit**  
  로그인 유저, 장바구니 수량, 최근 본 상품 같은 UI 상태를 전역으로 관리

- **Supabase**  
  인증/DB/API를 빠르게 구성하기 위해 선택. 상품·주문·리뷰 조회·저장과 결제 후처리에 사용

- **Firebase**  
  회원 인증과 배송지 정보 갱신에 사용

---

## 주문/결제 페이지

주문/결제 화면은 단독으로 구현했습니다.

- Toss Payments SDK 연동  
  신용카드, 토스페이, 네이버페이, 휴대폰결제, 계좌이체 5가지 수단별 결제 요청 파라미터를 분기 처리
- React Hook Form + Daum 주소 API  
  수령인/연락처/배송지 입력과 필수값 검증, 우편번호 검색까지 연결
- 결제 후처리  
  Supabase에 주문 저장 → 장바구니 삭제 → Firebase 배송지 정보 업데이트 순으로 처리

테스트 키 기준이라 실제 결제는 완료되지 않을 수 있고, 포트폴리오용으로 결제창 흐름까지 확인 가능하게 구성했습니다.

---

## 개발 기간

2025.03 ~ 진행중

---

## 구현 기능

- Supabase로 상품/장바구니/주문/리뷰 데이터 조회·관리, 로그인·아이디/비밀번호 찾기
- Toss Payments 결제 모듈 연동 및 장바구니 추가·삭제까지 구매 흐름 연결
- 카테고리 필터링, 브랜드 YouTube 영상 연동
- 프로필 사진 변경
- 배송 완료 상품 리뷰 작성·수정
- react-simple-captcha로 로그인 보안 강화
- button / aria-label 등으로 접근성 보완

### 1) Supabase API — 주문 저장 / 장바구니 삭제 / 비밀번호 변경

```ts
await supabase.from("payment").insert(insertDate);

const { data: paymentsData } = await supabase
  .from("carts")
  .delete()
  .eq("userId", userToken)
  .in("object_seq", selectObject);
```

결제 완료 후 주문 데이터를 넣고, 결제한 상품만 장바구니에서 지웁니다.  
검색(select) / 수정(update) / 삭제(delete)도 같은 방식으로 호출했습니다.

```ts
const { data: update } = await supabase.auth.updateUser({
  password: data.password,
});
```

비밀번호 찾기는 `supabase.auth.updateUser`로 처리했습니다.

### 2) Toss Payments — 결제수단별 요청

```ts
const PaymentMethod =
  data.paymentType === "P"
    ? "MOBILE_PHONE"
    : data.paymentType === "AT"
    ? "TRANSFER"
    : "CARD";

await payment.requestPayment({
  method: PaymentMethod,
  amount: {
    currency: "KRW",
    value:
      (priceData?.totalPrice ?? 0) >= 20000
        ? priceData?.totalPrice
        : (priceData?.totalPrice ?? 0) + 2500,
  },
  orderId,
  orderName:
    (product[0]?.objects?.name ?? "상품") +
    (product?.length === 1 ? "" : ` 외 ${product?.length - 1}건`),
  customerEmail: user?.email,
  customerName: data?.getName,
  customerMobilePhone: data?.phoneNumber?.replace(/[^0-9]/g, ""),
  // 카드 / 간편결제 / 계좌이체 옵션 분기
});
```

결제수단을 고른 뒤 `requestPayment`로 토스 결제창을 엽니다.  
카드사 선택, 할부, 네이버페이/토스페이 easyPay 옵션도 같이 넘깁니다.

### 3) 장바구니 추가·삭제 / 브랜드 유튜브

장바구니에 같은 상품이 있으면 수량만 올리고, 없으면 insert 합니다.  
삭제는 Supabase `carts`에서 해당 상품을 지운 뒤 Redux 수량도 맞춥니다.

```ts
<YouTube
  videoId={brandInfo?.videoLink}
  opts={opts}
  onEnd={(e) => {
    e.target.stopVideo(0);
  }}
/>
```

브랜드 상세에는 `react-youtube`로 소개 영상을 붙였습니다.

### 4) 프로필 사진 변경

파일 선택 → `FileReader`로 Data URL 변환 → 화면에 미리보기.  
마음에 안 들면 삭제도 가능합니다.

### 5) 리뷰 작성·수정

배송 완료된 상품만 리뷰를 남길 수 있게 했고,  
작성은 `insert`, 수정은 `update`로 처리했습니다.  
별점, 텍스트, 포토(최대 5장)까지 같이 저장합니다.

### 6) 로그인 캡차

```ts
loadCaptchaEnginge(6);

if (!validateCaptcha(data.captcha)) {
  alert("자동입력 방지문자를 확인해주세요.");
}
```

`react-simple-captcha`로 자동입력 방지 문자를 넣었습니다.

### 7) 접근성

모달에는 `role="dialog"`, `aria-modal`, `aria-labelledby`를 넣고  
아이콘 버튼에는 `aria-label`을 붙여 키보드·스크린리더 사용을 맞춰 두었습니다.

---

## 실행 방법

```bash
nvm use   # Node 20 이상
npm install
npm run dev
```

`.env` 예시:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
VITE_FIREBASE_API_KEY=
VITE_WAB_NAME=your-firebase-project-id
```

---

## 데모 계정

포트폴리오 확인용 계정은 로그인 페이지에 안내되어 있습니다.  
데모 로그인 버튼으로 captcha 없이 바로 들어가 볼 수 있습니다.

---

## Repository

[https://github.com/josoyean/olive-shop](https://github.com/josoyean/olive-shop)
