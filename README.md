## Intro

리액트 + 타입스크립트로 만든 올리브영 클론 페이지 **올리브샵**입니다.

상품 조회부터 장바구니, 주문/결제, 리뷰까지 구매 흐름을 직접 구현했고  
DB는 SQL로 다루고 싶어서 Supabase를 사용했습니다.

배포: [https://olive-shop.kro.kr/](https://olive-shop.kro.kr/)

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

## Description

### React + TypeScript 기반 주문/결제 페이지 단독 개발

주문/결제 화면(`store-user-cart-payment.tsx`)을 단독으로 구현했습니다.  
장바구니에서 `t_header_type=2`로 진입하면 결제 페이지가 렌더되고,  
배송지 입력 → 결제수단 선택 → Toss 결제 → 후처리 → 주문완료까지 한 흐름으로 이어집니다.

테스트 키 기준이라 실제 결제는 완료되지 않을 수 있고,  
포트폴리오용으로 결제창 흐름까지 확인 가능하게 구성했습니다.

```tsx
{headerType === "2" && <StoreUserPayment priceData={price} />}
{headerType === "3" && <StoreUserOrder />}
```

---

### Toss Payments SDK를 연동하고 5가지 결제수단에 따른 결제 흐름 구현

```ts
/**
 * C  신용카드  → CARD + cardCompany / 할부
 * T  토스페이  → CARD + easyPay: "토스페이"
 * N  네이버페이 → CARD + easyPay: "네이버페이"
 * P  휴대폰    → MOBILE_PHONE
 * AT 계좌이체  → TRANSFER + 현금영수증
 */
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

useEffect(() => {
  async function fetchPayment() {
    const tossPayments = await loadTossPayments(clientKey);
    const paymentInstance = tossPayments.payment({ customerKey });
    setPayment(paymentInstance);
  }
  fetchPayment();
}, []);

const PaymentMethod =
  data.paymentType === "P"
    ? "MOBILE_PHONE"
    : data.paymentType === "AT"
    ? "TRANSFER"
    : "CARD";

await payment.requestPayment({
  method: PaymentMethod,
  amount: { currency: "KRW", value: amountValue },
  orderId,
  orderName:
    (product[0]?.objects?.name ?? "상품") +
    (product?.length === 1 ? "" : ` 외 ${product?.length - 1}건`),
  customerEmail: user?.email,
  customerName: data?.getName,
  customerMobilePhone: data?.phoneNumber?.replace(/[^0-9]/g, ""),
  ...(data.paymentType === "P"
    ? {}
    : data.paymentType === "AT"
    ? {
        transfer: {
          cashReceipt: { type: "소득공제" },
          useEscrow: false,
        },
      }
    : {
        card: {
          useEscrow: true,
          flowMode: "DIRECT",
          useCardPoint: false,
          cardInstallmentPlan: !data?.installment ? 0 : data?.installment,
          useAppCardOnly: false,
          ...(data.paymentType === "C" ? { cardCompany: data.cardType } : {}),
          ...(data.paymentType === "N" ? { easyPay: "네이버페이" } : {}),
          ...(data.paymentType === "T" ? { easyPay: "토스페이" } : {}),
        },
      }),
});
```

---

### React Hook Form과 Daum 주소 API를 활용한 배송지 입력 및 유효성 검증 구현

```ts
import { useForm, Controller } from "react-hook-form";
import { useDaumPostcodePopup } from "react-daum-postcode";

const open = useDaumPostcodePopup(postcodeScriptUrl);
const { register, handleSubmit, setFocus, setValue, control } =
  useForm<DataType>({ mode: "onChange" });

const handleComplete = (data) => {
  setValue("addressMain", data?.roadAddress);
  setValue("postNumber", data?.zonecode);
  setValue("addressSub", "");
};

<form onSubmit={handleSubmit(onSubmit, onError)}>
  <input
    {...register("getName", {
      required: "받는분을 입력하세요.",
      minLength: { value: 2, message: "받는분을 정확하게 입력해주세요" },
    })}
  />
  <input {...register("phoneNumber", { required: "연락처를 입력하세요." })} />
  <input {...register("postNumber", { required: "주소를 입력하세요." })} disabled />
  <button type="button" onClick={() => open({ onComplete: handleComplete })}>
    우편번호 찾기
  </button>
  <input {...register("addressMain", { required: "주소를 입력하세요." })} disabled />
  <input {...register("addressSub", { required: "상세 주소를 입력하세요" })} />
</form>
```

---

### Supabase를 활용한 주문 저장, 장바구니 삭제 및 Firebase 배송지 갱신 등 결제 후처리 구현

```ts
/**
 * 1. Supabase payment 주문 저장
 * 2. Supabase carts 장바구니 삭제
 * 3. Firebase users 배송지 갱신
 * 4. Redux 장바구니 카운트 반영 + 주문완료 이동
 */
const selectObject = product.map((item: CartType) => item.object_seq);
await supabase.from("payment").insert(insertDate);

const { data: paymentsData } = await supabase
  .from("carts")
  .delete()
  .eq("userId", userToken)
  .in("object_seq", selectObject);

if (!paymentsData) {
  await updateDoc(doc(db, "users", userToken), {
    addressMain: data?.addressMain,
    addressSub: data?.addressSub,
    postNumber: data?.postNumber,
    deliveryPhone: data?.phoneNumber,
    deliveryName: data?.getName,
    enterInfo: data?.enter,
  });
  dispatch(deleteCart(selectObject.length));
  navigate("/store/mypage/user-cart?t_header_type=3", {
    state: {
      searchParams: { t_header_type: "3" },
      orderId: orderId,
    },
  });
  getUserInfo(userToken, dispatch);
}
```

---

## 개발 기간

2025.03 ~ 진행중

---

## 그 외 구현 기능

- Supabase로 상품/장바구니/리뷰 데이터 조회·관리, 로그인·아이디/비밀번호 찾기
- 카테고리 필터링, 브랜드 YouTube 영상 연동
- 프로필 사진 변경
- 배송 완료 상품 리뷰 작성·수정
- react-simple-captcha로 로그인 보안 강화
- button / aria-label 등으로 접근성 보완

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
