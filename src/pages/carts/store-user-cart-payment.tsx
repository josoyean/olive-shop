import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { GreenButton, InfoText } from "@/components/ui/FormElements";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, FieldErrors, Controller } from "react-hook-form";
import { db } from "../../firebase";
import { supabase } from "../../supabase";
import type { RootState } from "../../redux/store";
import { doc, updateDoc } from "firebase/firestore";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useDaumPostcodePopup } from "react-daum-postcode";
import Select from "@mui/material/Select";
import moment from "moment";
import type { CartType, PaymentObjectType, UserInfoType } from "components/card/card.type";
import {
  calculatePrice,
  handlePrice,
  getUserInfo,
  isEmptyObject,
} from "../../utils/common";
import { deleteCart } from "../../redux/reducers/userCartCount";
import type { PriceType } from "./store-user-cart";


const tagClasses = "!text-white whitespace-normal px-1.5 py-0.5 rounded-[10px] text-xs mr-0.5";
const informationClasses = cn(
  "flex items-center gap-5",
  "[&_.img-wrapper]:relative [&_.img-wrapper]:h-[85px] [&_.img-wrapper]:w-[85px] [&_.img-wrapper]:overflow-hidden [&_.img-wrapper]:rounded-[10px]",
  "[&_.img-wrapper_img]:h-[85px] [&_.img-wrapper_img]:w-[85px]",
  "[&_.img-wrapper_span]:absolute [&_.img-wrapper_span]:bottom-0 [&_.img-wrapper_span]:left-0 [&_.img-wrapper_span]:right-0 [&_.img-wrapper_span]:h-[22px] [&_.img-wrapper_span]:bg-black/50 [&_.img-wrapper_span]:text-center [&_.img-wrapper_span]:text-xs [&_.img-wrapper_span]:leading-[22px] [&_.img-wrapper_span]:text-white",
  "[&_.infor-wrapper]:max-w-[228px] [&_.infor-wrapper_span]:mb-1 [&_.infor-wrapper_span]:block [&_.infor-wrapper_span]:font-bold [&_.infor-wrapper_span]:text-[#fff]",
  "[&_.infor-wrapper_em]:mb-1 [&_.infor-wrapper_em]:block [&_.infor-wrapper_em]:text-xs [&_.infor-wrapper_em]:font-bold [&_.infor-wrapper_em]:text-[#fff]",
  "[&_.infor-wrapper_p]:mb-[5px] [&_.infor-wrapper_p]:line-clamp-2 [&_.infor-wrapper_p]:max-h-9 [&_.infor-wrapper_p]:overflow-hidden [&_.infor-wrapper_p]:text-sm [&_.infor-wrapper_p]:leading-[18px] [&_.infor-wrapper_p]:text-black"
);
const tableBoxClasses = cn(
  "[&>div:first-child]:mt-5 [&>div:not(:first-child)]:mt-10 [&_h3]:font-light",
  "[&_table]:my-2.5 [&_table]:w-full [&_table]:border-t [&_table]:border-black",
  "[&_tr]:border-b [&_tr]:border-[#e6e6e6]",
  "[&_th]:w-[170px] [&_th]:border-b [&_th]:border-[#e6e6e6] [&_th]:bg-[#f4f4f4] [&_th]:p-[15px] [&_th]:text-left [&_th]:text-sm [&_th]:font-normal [&_th]:text-[#222]",
  "[&_td]:border-b [&_td]:border-[#e6e6e6] [&_td]:p-[15px] [&_td]:text-[13px]",
  "[&_td_input]:!text-[13px] [&_td_p]:mt-[5px] [&_td_p]:text-[10px] [&_td_p_em]:text-red-600",
  "[&_.post_input]:mr-5 [&_.post_input]:w-[120px]",
  "[&_.post_button]:w-[100px] [&_.post_button]:border [&_.post_button]:border-primary [&_.post_button]:bg-white [&_.post_button]:text-primary",
  "[&_.address_td>div]:flex [&_.address_td>div]:flex-col [&_.address_td>div]:gap-2.5",
  "[&_.objects_table]:table-fixed [&_.objects_th]:p-2.5 [&_.objects_th]:text-center",
  "[&_.MuiFormControlLabel-label]:text-[13px] [&_.MuiFormControlLabel-label]:text-black",
  "[&_.MuiButtonBase-root]:p-[5px] [&_.Mui-checked>span]:text-primary"
);
const postcodeScriptUrl =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
interface CardType {
  [key: string]: string;
}

interface DataType {
  getName: string;
  phoneNumber: string;
  addressMain: string;
  addressSub: string;
  name: string;
  birthDy: string;
  code: string;
  email: string;
  postNumber: string;
  deliveryMessage: string;
  enter: string;
  enterText: string;
  paymentType: string;
  cardType: string;
  installment: number;
}

const koreanCardCompanyOptions: CardType[] = [
  { label: "국민카드", value: "국민" },
  { label: "신한카드", value: "신한" },
  { label: "삼성카드", value: "삼성" },
  { label: "현대카드", value: "현대" },
  { label: "롯데카드", value: "롯데" },
  { label: "우리카드", value: "우리" },
  { label: "하나카드", value: "하나" },
  { label: "비씨카드", value: "비씨" },
  { label: "NH농협카드", value: "농협" },
  { label: "카카오뱅크카드", value: "카카오" },
];
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const customerKey = "9MpfwKORMRh_XnuAnBYJP";

interface PropsType {
  priceData: PriceType | undefined | null;
}
const StoreUserPayment: React.FC<PropsType> = ({ priceData }) => {
  const locatiton = useLocation();
  const navigate = useNavigate();

  const product = locatiton.state.products;
  const dispatch = useDispatch();
  const open = useDaumPostcodePopup(postcodeScriptUrl);
  const userToken = useSelector((state: RootState) => state?.user.token);
  const userInfoData = useSelector((state: RootState) => state?.userInfo);
  const [user, setUser] = useState<UserInfoType | null>(null);
  const [payment, setPayment] = useState<ReturnType<
    Awaited<ReturnType<typeof loadTossPayments>>["payment"]
  > | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,

    control,
    watch,
    getValues,
  } = useForm<DataType>({
    mode: "onChange",
    defaultValues: {},
  });

  const enterType = watch("enter");
  const paymentType = watch("paymentType");
  // const userInfo = async () => {
  //   try {
  //     const usersRef = collection(db, "users"); // users 컬렉션 참조 installment
  //     const id = query(usersRef, where("userId", "==", userToken)); // 특정 이메일 찾기

  //     // 특정 이메일 찾기
  //     const idSnapshot = await getDocs(id);

  //     if (!idSnapshot.empty) {
  //       const data = idSnapshot.docs[0].data();
  //       setValue("phoneNumber", data.deliveryPhone || data?.phoneNumber);
  //       setValue("getName", data.deliveryName || data?.name);
  //       setValue("addressMain", data?.addressMain);
  //       setValue("addressSub", data?.addressSub);
  //       setValue("postNumber", data?.postNumber);
  //       setValue("enter", data?.enterInfo || "P");
  //       setValue("paymentType", "C");
  //       setUser(data);
  //       // test(data);
  //     }
  //   } catch (error) {}
  // };
  useEffect(() => {
    if (isEmptyObject(userInfoData)) return;

    setValue(
      "phoneNumber",
      userInfoData.deliveryPhone || userInfoData?.phoneNumber || ""
    );
    setValue("getName", userInfoData.deliveryName || userInfoData?.name || "");
    setValue("addressMain", userInfoData?.addressMain || "");
    setValue("addressSub", userInfoData?.addressSub || "");
    setValue("postNumber", userInfoData?.postNumber || "");
    setValue("enter", userInfoData?.enterInfo || "P");
    setValue("paymentType", "C");
    setUser(userInfoData);
  }, [userInfoData]);

  const test = async (data: DataType) => {
    const orderId = moment().format("YYYYMMDDhhmmss");

    const insertDate = {
      id: undefined, // 넣지 않아도 uuid 자동 생성됨
      userId: userToken,
      created_at: new Date().toISOString(),
      orderId: orderId,
      deliveryInfo: {
        name: data?.getName,
        phoneNumber: data?.phoneNumber,
        address: data?.addressMain + " " + data?.addressSub,
        enterType:
          data?.enter === "P"
            ? "공동현관 비밀번호"
            : data?.enter === "S"
            ? "경비실 호출"
            : data?.enter === "F"
            ? "자유 출입 가능"
            : "기타 상세내용",
        enterText: data?.enter === "F" ? "" : data?.enterText ?? "",
        enterMessage: data?.deliveryMessage ?? "",
      },
      paymentInfo: {
        totalCount: priceData?.totalCount,
        disCount: priceData?.disCount,
        totalPrice:
          (priceData?.totalPrice ?? 0) >= 20000
            ? priceData?.totalPrice
            : (priceData?.totalPrice ?? 0) + 2500,
        countType:
          data?.paymentType === "C"
            ? "신용카드"
            : data?.paymentType === "T"
            ? "토스페이"
            : data?.paymentType === "N"
            ? "네이버페이"
            : data?.paymentType === "P"
            ? "휴대폰결제"
            : "계좌이체",
        installment:
          !data?.installment || data?.installment === 0 ? 1 : data?.installment,
      },
      objectsInfo: productDate,
      deliveryStep: 1,
    };

    await supabase.from("payment").insert(insertDate);
    alert("결제 왼료 테스트");
    navigate("/store/mypage/user-cart?t_header_type=3", {
      state: {
        searchParams: { t_header_type: "3" },
        orderId: orderId,
      },
    });
  };
  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        if (typeof tossPayments.payment !== "function") {
          throw new Error(
            "tossPayments.payment 함수가 존재하지 않습니다. SDK 버전과 문서를 확인하세요."
          );
        }

        // 결제창 인스턴스를 만들고 state에 저장해야 requestPayment가 동작합니다.
        const paymentInstance = tossPayments.payment({ customerKey });
        setPayment(paymentInstance);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }
    fetchPayment();
  }, []);

  const productDate = product?.map((item: CartType) => {
    return {
      object_count: item.object_count,
      img: item?.objects?.img,
      name: item?.objects?.name,
      brand: item?.objects?.brand,
      brand_seq: item?.objects?.brand_seq,
      count: item?.objects?.count,
      discount_rate: item?.objects?.saleItem?.discount_rate,
      one_more: item?.objects?.saleItem?.one_more,
      sale_count: calculatePrice(
        item?.object_count ?? 0,
        item?.objects?.saleItem?.one_more,
        handlePrice(item?.objects?.saleItem, item?.objects?.count)
      ),
      payment_seq: moment().format("YYYYMMDDhhmmss") + item.object_seq,
      object_seq: item.object_seq,
      saleItem: !item?.objects?.saleItem ? false : true,
    };
  }) as PaymentObjectType[];
  const onSubmit = async (data: DataType) => {
    alert(
      "테스트(포트폴리오) 환경에서는 실제 결제가 완료되지 않을 수 있습니다.\n확인을 누르면 결제창으로 이동합니다."
    );

    if (!payment) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const orderId = moment().format("YYYYMMDDhhmmss");

    const PaymentMethod =
      data.paymentType === "P"
        ? "MOBILE_PHONE"
        : data.paymentType === "AT"
        ? "TRANSFER"
        : "CARD";

    const amountValue =
      (priceData?.totalPrice ?? 0) >= 20000
        ? priceData?.totalPrice ?? 0
        : (priceData?.totalPrice ?? 0) + 2500;

    try {
      await payment.requestPayment({
        method: PaymentMethod, // 카드 및 간편결제
        amount: {
          currency: "KRW",
          value: amountValue,
        },
        orderId: orderId, // 고유 주문번호
        orderName:
          (product[0]?.objects?.name ?? product[0]?.name ?? "상품") +
          (product?.length === 1 ? "" : ` 외 ${product?.length - 1}건`),
        customerEmail: user?.email,
        customerName: data?.getName,
        customerMobilePhone: data?.phoneNumber?.replace(/[^0-9]/g, ""),
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
          userId: user?.userId,
          paymentDt: new Date().toISOString(),
          orderId: "Y" + orderId,
        },
        // 결제수단별 파라미터가 union으로 묶여 SDK 오버로드와 맞지 않아 캐스팅합니다.
      } as unknown as Parameters<typeof payment.requestPayment>[0]);
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제가 취소되었거나 실패했습니다.");
      return;
    }
    const insertDate = {
      id: undefined, // 넣지 않아도 uuid 자동 생성됨
      userId: userToken,
      created_at: new Date().toISOString(),
      orderId: orderId,
      deliveryInfo: {
        name: data?.getName,
        phoneNumber: data?.phoneNumber,
        address: data?.addressMain + " " + data?.addressSub,
        enterType:
          data?.enter === "P"
            ? "공동현관 비밀번호"
            : data?.enter === "S"
            ? "경비실 호출"
            : data?.enter === "F"
            ? "자유 출입 가능"
            : "기타 상세내용",
        enterText: data?.enter === "F" ? "" : data?.enterText ?? "",
        enterMessage: data?.deliveryMessage ?? "",
      },
      paymentInfo: {
        totalCount: priceData?.totalCount,
        disCount: priceData?.disCount,
        totalPrice:
          (priceData?.totalPrice ?? 0) >= 20000
            ? priceData?.totalPrice
            : (priceData?.totalPrice ?? 0) + 2500,
        countType:
          data?.paymentType === "C"
            ? "신용카드"
            : data?.paymentType === "T"
            ? "토스페이"
            : data?.paymentType === "N"
            ? "네이버페이"
            : data?.paymentType === "P"
            ? "휴대폰결제"
            : "계좌이체",
        installment:
          !data?.installment || data?.installment === 0 ? 1 : data?.installment,
      },
      objectsInfo: productDate,
      deliveryStep: 1,
    };

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
  };

  const onError = (errors: FieldErrors<DataType>) => {
    const errorKeys = Object.keys(errors);
    const fieldsOrder: (keyof DataType)[] = [
      "getName",
      "phoneNumber",
      "addressMain",
      "addressSub",
      "name",
      "birthDy",
      "code",
      "email",
      "postNumber",
      "deliveryMessage",
      "enter",
      "enterText",
      "paymentType",
      "cardType",
      "installment",
    ];
    if (errorKeys.length === 0) return;

    const firstError = fieldsOrder.find((key) => errorKeys.includes(key));
    if (!firstError) return;

    const fieldError = errors[firstError]; // FieldError | undefined

    if (!fieldError) return;

    if (fieldError.type === "noSpaces") {
      setValue(firstError, "");
    }

    setFocus(firstError);
    alert(fieldError.message || "Form validation error");
  };

  const handleComplete = (data) => {
    setValue("addressMain", data?.roadAddress);
    setValue("postNumber", data?.zonecode);
    setValue("addressSub", "");
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      role="form"
      aria-label="주문/결제 폼"
      className="relative z-[9] -mt-5 rounded-[5px] bg-white p-5 [&_input[type=text]]:h-7 [&_input[type=text]]:w-[400px] [&_input[type=text]]:rounded-md [&_input[type=text]]:border [&_input[type=text]]:border-line-sub [&_input[type=text]]:px-[5px] [&_input[type=text]]:text-[15px] [&_input[type=text]]:text-[#131518] [&_input[type=text]:focus]:border-primary [&_input[type=text]:focus]:outline-none"
    >
      <div className="title-box flex items-center justify-between border-t-2 border-black py-[15px]">
        <h2>주문 / 결제</h2>
      </div>

      <div className={tableBoxClasses}>
        <div>
          <h3>배송지정보</h3>
          <table>
            <thead>
              <tr>
                <th>배송지명</th>
                <td>{user?.name ?? ""}</td>
              </tr>
              <tr>
                <th>
                  받은분 <InfoText>*</InfoText>
                </th>
                <td>
                  <input
                    type="text"
                    placeholder="받은분"
                    {...register("getName", {
                      required: "받는분을 입력하세요.",
                      minLength: {
                        value: 2,
                        message: "받는분을 정확하게 입력해주세요",
                      },
                    })}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  연락처 <InfoText>*</InfoText>
                </th>
                <td>
                  <input
                    type="text"
                    {...register("phoneNumber", {
                      required: "연락처를 입력하세요.",
                    })}
                  />
                </td>
              </tr>
              <tr className="address">
                <th>
                  주소 <InfoText>*</InfoText>
                </th>
                <td className="address">
                  <div>
                    <div className="post flex items-center">
                      <input
                        type="text"
                        className="post_input"
                        {...register("postNumber", {
                          required: "주소를 입력하세요.",
                        })}
                        disabled
                      />
                      <GreenButton
                        type="button"
                        className="post_button"
                        onClick={(event) => {
                          event.preventDefault();
                          open({ onComplete: handleComplete });
                          // alert("준비중입니다");
                        }}
                      >
                        우편번호 찾기
                      </GreenButton>
                    </div>
                    <input
                      type="text"
                      {...register("addressMain", {
                        required: "주소를 입력하세요.",
                      })}
                      disabled
                    />
                    <input
                      type="text"
                      {...register("addressSub", {
                        required: "상세 주소를 입력하세요",
                      })}
                    />
                  </div>
                </td>
              </tr>
            </thead>
          </table>
        </div>
        <div>
          <h3>배송지 요청사항</h3>
          <table>
            <thead>
              <tr>
                <th>배송 메시지</th>
                <td>
                  <input
                    type="text"
                    placeholder="배송 메시지를 입력해주세요"
                    {...register("deliveryMessage", {})}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  공동현관 출입 방법
                  <InfoText>*</InfoText>
                </th>
                <td>
                  <Controller
                    name="enter"
                    control={control}
                    rules={{ required: "공동현관 출입방법을 선택해주새요" }}
                    defaultValue="P"
                    render={({ field }) => (
                      <FormControl>
                        <RadioGroup
                          {...field}
                          row
                          aria-labelledby="demo-row-radio-buttons-group-label"
                          name="row-radio-buttons-group"
                        >
                          <FormControlLabel
                            value="P"
                            control={
                              <Radio
                                color="secondary"
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 15,
                                  },
                                }}
                              />
                            }
                            label="비밀번호"
                          />
                          <FormControlLabel
                            value="S"
                            control={
                              <Radio
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 15,
                                  },
                                }}
                              />
                            }
                            label="경비실 호출"
                          />
                          <FormControlLabel
                            value="F"
                            control={
                              <Radio
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 15,
                                  },
                                }}
                              />
                            }
                            label="자유 출입 가능"
                          />
                          <FormControlLabel
                            value="E"
                            control={
                              <Radio
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 15,
                                  },
                                }}
                              />
                            }
                            label="기타 사항"
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </td>
              </tr>
              {getValues("enter") !== "F" && (
                <tr className="">
                  <th>
                    {enterType &&
                      (getValues("enter") === "P"
                        ? "공동현관 비밀번호"
                        : getValues("enter") === "S"
                        ? "경비실 호출 방법"
                        : "기타 상세")}
                    <InfoText>*</InfoText>
                  </th>
                  <td>
                    <input
                      type="text"
                      {...register("enterText", {
                        required:
                          (getValues("enter") === "P"
                            ? "공동현관 비밀번호"
                            : getValues("enter") === "S"
                            ? "경비실 호출 방법"
                            : "기타 상세내용") + "을(를) 입력해주새요",
                      })}
                    />
                    {enterType && getValues("enter") === "P" && (
                      <p>
                        상품이 반송되지 않도록 <em>공동현관 정보</em>를 꼭
                        확인해주세요!
                      </p>
                    )}
                  </td>
                </tr>
              )}
              <tr className="">
                <th>출입정보 저장</th>
                <td>배송 관련 정보 수정 시, 기존 배송지 정보에 반영됩니다.</td>
              </tr>
            </thead>
          </table>
        </div>
        <div className="objects">
          <h3>올리브샵 배송상품</h3>
          <table className="objects_table">
            <thead>
              <tr>
                <th className="objects_th" style={{ width: "50%" }}>상품정보</th>
                <th className="objects_th" style={{ width: "20%" }}>판매가</th>
                <th className="objects_th" style={{ width: "15%" }}>수량</th>
                <th className="objects_th" style={{ width: "15%" }}>구매가</th>
              </tr>
            </thead>
            <tbody>
              {product?.map((item: CartType, index: number) => (
                <tr key={index}>
                  <td className="border-r border-[#e6e6e6] p-[30px]">
                    <div className={informationClasses}>
                      <div className="img-wrapper">
                        <img src={item?.objects?.img} alt="productImg" />
                        {item?.objects?.soldOut && <span>품절</span>}
                      </div>
                      <div className="infor-wrapper">
                        {moment().isBetween(
                          item?.objects?.saleItem?.start_sale_date,
                          item?.objects?.saleItem?.end_sale_date
                        ) && (
                          <em>
                            {moment(
                              item?.objects?.saleItem?.start_sale_date
                            ).format("MM/DD")}
                            ~
                            {moment(
                              item?.objects?.saleItem?.end_sale_date
                            ).format("MM/DD")}
                            까지
                          </em>
                        )}
                        <span>{item?.objects?.brand}</span>
                        <p>{item?.objects?.name}</p>
                        <div className="!justify-normal gap-px flex flex-row">
                          {item?.objects?.saleItem !== null && (
                            <span className={cn(tagClasses, "bg-sale")}>세일</span>
                          )}
                          {item?.objects?.coupon && (
                            <span className={cn(tagClasses, "bg-coupon")}>쿠폰</span>
                          )}
                          {item?.objects?.saleItem?.one_more && (
                            <span className={cn(tagClasses, "bg-one-more")}>
                              {item?.objects?.saleItem?.one_more}+1
                            </span>
                          )}
                          {moment().isBetween(
                            item?.objects?.saleItem?.start_today_sale_date,
                            item?.objects?.saleItem?.end_today_sale_date
                          ) && (
                            <span className={cn(tagClasses, "bg-today-sale")}>오특</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="count border-r border-[#e6e6e6] text-center text-sm font-medium text-[#222]">
                    {item?.objects?.count?.toLocaleString()}원
                  </td>
                  <td className="objectCount border-r border-[#e6e6e6] text-center text-sm text-[#b5b5b5]">
                    {item?.object_count}
                  </td>
                  <td className="discount border-r-0 text-center [&_em]:block [&_em]:text-[13px] [&_em]:text-[#b5b5b5] [&_em]:line-through [&_p]:mt-[3px] [&_p]:block [&_p]:text-[15px] [&_p]:font-medium [&_p]:text-text-red">
                    {moment().isBetween(
                      item?.objects?.saleItem?.start_sale_date,
                      item?.objects?.saleItem?.end_sale_date
                    ) ? (
                      <>
                        <em>
                          {calculatePrice(
                            item?.object_count ?? 0,
                            item?.objects?.saleItem?.one_more,
                            handlePrice(null, item?.objects?.count)
                          )?.toLocaleString()}
                          원
                        </em>
                        <p>
                          {calculatePrice(
                            item?.object_count ?? 0,
                            item?.objects?.saleItem?.one_more,
                            handlePrice(
                              item?.objects?.saleItem,
                              item?.objects?.count
                            )
                          )?.toLocaleString()}
                          원
                        </p>
                      </>
                    ) : (
                      calculatePrice(
                        item?.object_count ?? 0,
                        item?.objects?.saleItem?.one_more,
                        handlePrice(null, item?.objects?.count)
                      )?.toLocaleString()
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="payment flex gap-10 [&>div]:w-full">
          <div style={{ width: "60%" }}>
            <h3>결제수단 선택</h3>
            <table>
              <thead>
                <tr>
                  <th colSpan={2}>
                    <Controller
                      name="paymentType"
                      control={control}
                      defaultValue="C"
                      render={({ field }) => (
                        <FormControl>
                          <RadioGroup
                            {...field}
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                          >
                            <FormControlLabel
                              value="C"
                              control={
                                <Radio
                                  color="secondary"
                                  sx={{
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 15,
                                    },
                                  }}
                                />
                              }
                              label="신용카드"
                            />
                            <FormControlLabel
                              value="T"
                              control={
                                <Radio
                                  sx={{
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 15,
                                    },
                                  }}
                                />
                              }
                              label="토스페이"
                            />
                            <FormControlLabel
                              value="N"
                              control={
                                <Radio
                                  sx={{
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 15,
                                    },
                                  }}
                                />
                              }
                              label="네이버페이"
                            />
                            <FormControlLabel
                              value="P"
                              control={
                                <Radio
                                  sx={{
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 15,
                                    },
                                  }}
                                />
                              }
                              label="휴대폰결제"
                            />
                            <FormControlLabel
                              value="AT"
                              control={
                                <Radio
                                  sx={{
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 15,
                                    },
                                  }}
                                />
                              }
                              label="계좌이체"
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                  </th>
                </tr>
                {paymentType && getValues("paymentType") === "C" && (
                  <>
                    <tr>
                      <th>
                        카드종류 <InfoText>*</InfoText>
                      </th>
                      <td>
                        <Controller
                          name="cardType"
                          control={control}
                          rules={{ required: "카드종류를 선택해주새요" }}
                          render={({ field }) => (
                            <FormControl sx={{ minWidth: 300 }} size="small">
                              <Select
                                {...field}
                                sx={{ height: 30, fontSize: "12px" }}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                defaultValue="none"
                                value={getValues("cardType") || "none"}
                                onChange={(event) => {
                                  setValue("cardType", event.target.value);
                                }}
                                disabled={product?.objects?.soldOut}
                              >
                                <MenuItem value="none" disabled>
                                  카드사를 선택해주세요
                                </MenuItem>
                                {koreanCardCompanyOptions &&
                                  koreanCardCompanyOptions?.map(
                                    (option: CardType, index: number) => (
                                      <MenuItem
                                        value={option?.value}
                                        key={index}
                                      >
                                        {option.label}
                                      </MenuItem>
                                    )
                                  )}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>할부종류</th>
                      <td>
                        <Controller
                          name="installment"
                          control={control}
                          render={({ field }) => (
                            <FormControl sx={{ minWidth: 100 }} size="small">
                              <Select
                                {...field}
                                disabled={
                                  ((priceData?.totalPrice ?? 0) >= 20000
                                    ? priceData?.totalPrice ?? 0
                                    : (priceData?.totalPrice ?? 0) + 2500) <
                                  50000
                                }
                                sx={{ height: 30, fontSize: "12px" }}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                defaultValue={0}
                                value={getValues("installment") || 0}
                                onChange={(event) => {
                                  event.preventDefault();
                                  setValue(
                                    "installment",
                                    Number(event.target.value)
                                  );
                                }}
                              >
                                <MenuItem value={0}>일시불</MenuItem>
                                <MenuItem value={2}>2개월</MenuItem>
                                <MenuItem value={3}>3개월</MenuItem>
                                <MenuItem value={4}>4개월</MenuItem>
                                <MenuItem value={5}>5개월</MenuItem>
                                <MenuItem value={6}>6개월</MenuItem>
                                <MenuItem value={7}>7개월</MenuItem>
                                <MenuItem value={8}>8개월</MenuItem>
                                <MenuItem value={9}>9개월</MenuItem>
                                <MenuItem value={10}>10개월</MenuItem>
                                <MenuItem value={11}>11개월</MenuItem>
                                <MenuItem value={12}>12개월</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </td>
                    </tr>
                  </>
                )}
              </thead>
            </table>
          </div>
          <div style={{ width: "40%" }}>
            <h3>최종 결제정보</h3>
            <p className="mt-2 text-xs leading-5 text-text-sub">
              ※ 테스트(포트폴리오) 환경에서는 실제 결제가 완료되지 않을 수 있습니다.
            </p>
            <div className="my-2.5 w-full rounded-sm border-2 border-black p-[15px] [&_li]:flex [&_li]:justify-between [&_li]:py-2 [&_li>*]:text-sm [&_li>*]:text-[#222] [&_li_span]:font-semibold [&_li_span.color]:text-star [&_.total]:mt-2.5 [&_.total]:border-t [&_.total]:border-black [&_.total_li]:p-3 [&_.total_li>*]:text-[17px] [&_.total_li>*]:font-semibold [&_.total_button]:block [&_.total_button]:w-full [&_.total_button]:rounded-[5px] [&_.total_button]:bg-star [&_.total_button]:p-[15px] [&_.total_button]:text-[19px] [&_.total_button]:text-white">
              <ul>
                <li>
                  <em>총 상품금액</em>
                  <span>{priceData?.totalCount?.toLocaleString()}원</span>
                </li>

                <li>
                  <em>쿠폰할인금액</em>
                  <span className="color">
                    {priceData?.disCount === 0
                      ? "0"
                      : "-" + priceData?.disCount?.toLocaleString()}
                    원
                  </span>
                </li>
                <li>
                  <em>총 배송비</em>
                  <span>
                    {(priceData?.totalPrice ?? 0) >= 20000 ? "0" : "2,500"}원
                  </span>
                </li>
              </ul>
              <ul className="total">
                <li>
                  <em>최종 결제금액</em>
                  <span className="color">
                    {(priceData?.totalPrice ?? 0) >= 20000
                      ? priceData?.totalPrice?.toLocaleString()
                      : ((priceData?.totalPrice ?? 0) + 2500)?.toLocaleString()}
                    원
                  </span>
                </li>
                <li>
                  <button type="submit">결제하기</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default StoreUserPayment;
