## **Intor**

리액트 기반으로 타입스크립트로 제작한 올리브영 클론 페이지 <올리브샵>입니다.

DB는 SQL로 자유롭게 사용하고 싶어서 슈퍼베이스를 사용을해서 페이지를 제작했습니다.

## **사용기술**

lang - react, styled-components , typesjavascript, react-query, redex

배포 - vercel.app

## **개발 기간**

2025.03 ~ 진행중

## **구현 기능**

\- Supabase API를 활용해 데이터 조회 및 관리 기능 구현,로그인, 아이디·비밀번호 찾기 기능 연동

\- Toss Payments 결제 모듈 연동 및 결제 프로세스 구현, 장바구니 추가·삭제 기능을 통해 사용자의 구매 흐름을 완성

\- 카테고리별 상품 분류 및 필터링 기능을 적용해 사용자가 원하는 상품을 효율적으로 탐색할 수 있도록 개선했습니다.또한 브랜드 관련 유튜브 영상을 연동해 콘텐츠 다양성을 확보

\-  사용자 프로필 사진 변경 기능을 구현해 개인화된 사용자 경험을 제공

\- 사용자가 구매한 제품에 대해 리뷰 작성·수정·삭제 기능을 구현하여, 서비스 내 사용자 참여 요소를 강화

\- react-simple-captcha를 적용해 로그인 시 보안 요소를 강화

\- 클릭 요소를 button 태그로 통일하고 아이콘 버튼에 aria-label을 적용해 접근성 개선

#### 1) Supabase API를 활용해 데이터 조회 및 관리 기능 구현,로그인, 아이디·비밀번호 찾기 기능 연동

```
 await supabase.from("payment").insert(insertDate);

    const { data: paymentsData } = await supabase
      .from("carts")
      .delete()
      .eq("userId", userToken)
      .in("object_seq", selectObject);
```

Supabase API 장바구니 관련 데이터를 삭제하는 슈퍼베이스 api 형식으로 작업,

검색(select),업데이트(update),삭제(delete) 이용해서 api 호출,수정,삭제를 했습니다

```
  const { data: update } = await supabase.auth.updateUser({
      password: data.password,
    });
```

Supabase.auth.updateUser 이용해서 슈퍼베이스에 저장되어있는 사용자 정보(비밀번호)을 수정했습니다

#### 2) Toss Payments 결제 모듈 연동 및 결제 프로세스 구현, 장바구니 추가·삭제 기능을 통해 사용자의 구매 흐름을 완성

```
 const orderId = moment().format("YYYYMMDDhhmmss");

    const PaymentMethod =
      data.paymentType === "P"
        ? "MOBILE_PHONE"
        : data.paymentType === "AT"
        ? "TRANSFER"
        : "CARD";

    await payment?.requestPayment({
      method: PaymentMethod, // 카드 및 간편결제
      amount: {
        currency: "KRW",
        value:
          (priceData?.totalPrice ?? 0) >= 20000
            ? priceData?.totalPrice
            : (priceData?.totalPrice ?? 0) + 2500,
        //100,
      },
      orderId: orderId, // 고유 주문번호
      orderName:
        product[0].name +
        (product?.length === 1 ? "" : ` 외 ${product?.length - 1}건`),
      customerEmail: user?.email,
      customerName: data?.getName,
      customerMobilePhone: data?.phoneNumber,
      ...(data.paymentType === "P"
        ? {}
        : data.paymentType === "AT"
        ? {
            transfer: {
              cashReceipt: {
                type: "소득공제",
              },
              useEscrow: false,
            },
          }
        : {
            card: {
              useEscrow: true,
              flowMode: "DIRECT", // 자체창 여는 옵션
              useCardPoint: false,
              cardInstallmentPlan: !data?.installment ? 0 : data?.installment,
              useAppCardOnly: false,
              ...(data.paymentType === "C"
                ? { cardCompany: data.cardType }
                : {}),
              ...(data.paymentType === "N" ? { easyPay: "네이버페이" } : {}),
              ...(data.paymentType === "T" ? { easyPay: "토스페이" } : {}),
            },
          }),
      metadata: {
        userId: user.userId,
        paymentDt: new Date(),
        orderId: "Y" + orderId,
      },
    });
```

결제 수단을 선택후 결제하기 클릭하면 tosspayments-테스트버전 연결 했습니다

테스트 버전이라 결제해도 시간 지나면 자동으로 취소가 되고 결제수단이 다양할수록 간편하게 결제를 해서 사용자가 많이 질거라 예상하고 할수있는만큼 작업을 했습니다

#### 3) 카테고리별 상품 분류 및 필터링 기능을 적용해 사용자가 원하는 상품을 효율적으로 탐색할 수 있도록 개선했습니다.또한 브랜드 관련 유튜브 영상을 연동해 콘텐츠 다양성을 확보

```
  const { data: cartInfo } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", user?.uid)
    .eq("object_seq", objects.object_seq)
    .single();

  if (!cartInfo || cartInfo?.length === 0) {
    // 장바구니 없음

    const { saleItem, addCount, ...cleanedObject } = objects;
    if (!addCount || !saleItem) {
      return;
    }
    const { error } = await supabase.from("carts").insert([
      {
        object_count: objects?.addCount,
        ...cleanedObject,
        created_at: new Date().toISOString(),
        userId: user?.uid, // 사용자 ID 추가
      },
    ]);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요");
      return;
    }
  } else {
    // 장바구니 있음
    const count: number = cartInfo?.object_count + objects?.addCount;

    const { error } = await supabase
      .from("carts")
      .update({
        object_count: count,
      })
      .eq("userId", user?.uid)
      .eq("object_seq", objects?.object_seq);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요");
      return;
    }
  }
```

```
    // 장바구니 삭제
    cartDataDelete(userToken, seq)
      .then((data) => {
        if (!data) {
          alert("제품 삭제가 되었습니다");
          handleCartItems(userToken, dispatch);
          return;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
```

우선 내 장바구니에 그제품이 있는지 확인후에 있으면 장바구니 갯수추가, 없으면 장바구니에 제품을 추가을 했습니다. 

장바구니 삭제는 슈퍼베이스에 있는 데이터를 전부 삭제했습니다.

```
import YouTube, { YouTubeProps } from "react-youtube";
  const opts: YouTubeProps["opts"] = {
    height: "394",
    width: "700",
    playerVars: {
      modestbranding: 1,
      autoplay: 1,
      rel: 0,
      controls: 0,
      loop: 0,
      mute: 1,
      cc_load_policy: 0,
    },
  };
    <YouTube videoId={brandInfo?.videoLink} opts={opts} onEnd={(e) => { e.target.stopVideo(0)}}/>
```

react-youtube 이용해서 제품에 맞는 유튜브 광고를 보게했고 옵션에 크기와 재생시작 위치,반복 다양한 옵션을 이용해서 사용자가 광보를 보고 제품을 구입하게끔 적용했습니다.

#### 4) 사용자 프로필 사진 변경 기능을 구현해 개인화된 사용자 경험을 제공

```
<input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                  <span
                    className="thumbnailFile"
                    onClick={(event) => {
                      event.preventDefault();
                      fileInputRef?.current?.click();
                    }}
                  >
                  
  	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMyInfoData(
        (prevState: UserInfoType) =>
          ({
            ...prevState,
            profileImg: reader.result,
          } as UserInfoType)
      );
    };
    reader.readAsDataURL(file);
  };
```

파일 선택을 하면 선택한 사진url로 변환하고 나서 화면에 보이게 했습니다.   
반대로 사진 프로필이 마음에 안들면 삭제도 가능하게 만들었습니다

#### 5) 사용자가 구매한 제품에 대해 리뷰 작성·수정·삭제 기능을 구현하여, 서비스 내 사용자 참여 요소를 강화

```
 // 리뷰 작성
 const items = {
      created_at: new Date().toISOString(),
      reviewImg: reviewImages,
      reviewText: data.textValue,
      score: Number(data.ratingValue),
      userId: token,
      objectInfo: selectReview?.object_seq,
      payment_seq: selectReview?.payment_seq,
      orderId: selectReview?.orderId,
      order_at: selectReview?.created_at,
      likeUserId: [],
    };

    const { data: existingItem, error } = await supabase
      .from("reviews")
      .insert([items]);
    if (error) {
      console.log("error", error);
      return;
    }
    if (!existingItem) {
      handlePaymentList(selectReview?.payment_seq || "");
    }
    
  // 리뷰 수정
   const { data: editData, error: errorData } = await supabase
        .from("reviews")
        .update({
          reviewImg: reviewImages,
          reviewText: data.textValue,
          score: Number(data.ratingValue),
        })
        .eq("id", selectReview?.id)
        .eq("payment_seq", selectReview?.payment_seq)
        .eq("userId", token);
      if (errorData) {
        console.log("error", errorData);
        return;
      }

      if (!editData) {
        alert("리뷰 수정이 완료되었습니다.");
        handleWriteReview();
      }
```

리뷰 추가는 insert,수정은 update 이용해서 구매하고 배송 완료된 상품은 리뷰를 추가 또는 수정하게끔 헸습니다.

#### 6) react-simple-captcha를 적용해 로그인 시 보안 요소를 강화

```
   <LoadCanvasTemplateNoReload reloadColor="red" reloadText="reload"/>
              <span onClick={() => loadCaptchaAgain()}>&#x21bb;</span>
              
//react-simple-captcha 갯수 지정
useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);
  
  // react-simple-captcha 실헹시
if (!validateCaptcha(data.captcha)) {
      alert("자동입력 방지문자를 확인해주세요.");
    }
```

로그인시 보안 강화를 위해 자동 입력 방지 문자를 사용해서 사용자가 안심하게 서비스를 이용할수있도록 적용했습니다.

#### 7) 클릭 요소를 button 태그로 통일하고 아이콘 버튼에 aria-label을 적용해 접근성 개선
​
```
  <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      onRequestClose={() => onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      shouldCloseOnOverlayClick={false}
    >
```
​
role,aria-modal,aria-label 를 사용해서 적용해 키보드·스크린리더 접근성을 개선 했습니다

[https://github.com/josoyean/olive-shop](https://github.com/josoyean/olive-shop)

 [GitHub - josoyean/olive-shop

Contribute to josoyean/olive-shop development by creating an account on GitHub.

github.com](https://github.com/josoyean/olive-shop)

