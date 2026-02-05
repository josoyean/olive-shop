import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, FieldErrors, Controller } from "react-hook-form";
import { db } from "../../firebase";
import { supabase } from "../../supabase";
import type { RootState } from "../../redex/store";
import { doc, updateDoc } from "firebase/firestore";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import { GreenBtn, Info, Tags } from "../../../public/assets/style";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useDaumPostcodePopup } from "react-daum-postcode";
import Select from "@mui/material/Select";
import moment from "moment";
import type { CartType, PaymentObjectType, UserInfoType } from "compontents/card/card.type";
import {
  calculatePrice,
  handlePrice,
  getUserInfo,
  isEmptyObject,
} from "../../bin/common";
import { deleteCart } from "../../redex/reducers/userCartCount";
import type { PriceType } from "./store-user-cart";
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
  const [payment] = useState(null);

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
        console.log("tossPayments 객체:", tossPayments);

        if (typeof tossPayments.payment !== "function") {
          throw new Error(
            "tossPayments.payment 함수가 존재하지 않습니다. SDK 버전과 문서를 확인하세요."
          );
        }

      
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }
    fetchPayment();
  }, [clientKey, customerKey]);

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
    // test(data);
    //console.log(data);
    // return;
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
    <Container onSubmit={handleSubmit(onSubmit, onError)} role="form" aria-label="주문/결제 폼">
      <div className="title-box">
        <h2>주문 / 결제</h2>
      </div>

      <TableBox>
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
                  받은분 <Info>*</Info>
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
                  연락처 <Info>*</Info>
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
                  주소 <Info>*</Info>
                </th>
                <td>
                  <div>
                    <div className="post">
                      <input
                        type="text"
                        {...register("postNumber", {
                          required: "주소를 입력하세요.",
                        })}
                        disabled
                      />
                      <GreenBtn
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          open({ onComplete: handleComplete });
                          // alert("준비중입니다");
                        }}
                      >
                        우편번호 찾기
                      </GreenBtn>
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
                  <Info>*</Info>
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
                    <Info>*</Info>
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
          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>상품정보</th>
                <th style={{ width: "20%" }}>판매가</th>
                <th style={{ width: "15%" }}>수량</th>
                <th style={{ width: "15%" }}>구매가</th>
              </tr>
            </thead>
            <tbody>
              {product?.map((item: CartType, index: number) => (
                <tr key={index}>
                  <TableBody style={{ padding: "30px" }}>
                    <Information>
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
                        <Tags>
                          {item?.objects?.saleItem !== null && (
                            <span className="sale">세일</span>
                          )}
                          {item?.objects?.coupon && (
                            <span className="coupon">쿠폰</span>
                          )}
                          {item?.objects?.saleItem?.one_more && (
                            <span className="oneMore">
                              {item?.objects?.saleItem?.one_more}+1
                            </span>
                          )}
                          {moment().isBetween(
                            item?.objects?.saleItem?.start_today_sale_date,
                            item?.objects?.saleItem?.end_today_sale_date
                          ) && <span className="today_sale">오특</span>}
                        </Tags>
                      </div>
                    </Information>
                  </TableBody>
                  <TableBody className="count">
                    {item?.objects?.count?.toLocaleString()}원
                  </TableBody>
                  <TableBody className="objectCount">
                    {item?.object_count}
                  </TableBody>
                  <TableBody className="discount">
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
                  </TableBody>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaymentBox className="payment">
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
                        카드종류 <Info>*</Info>
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
            <PaymentInfo>
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
            </PaymentInfo>
          </div>
        </PaymentBox>
      </TableBox>
    </Container>
  );
};

/* 결제 정보 */

const Information = styled.div`
  column-gap: 20px;
  display: flex;
  align-items: center;
  .img-wrapper {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    width: 85px;
    height: 85px;
    img {
      width: 85px;
      height: 85px;
    }
    span {
      position: absolute;
      width: 100%;
      line-height: 22px;
      height: 22px;
      font-size: 12px;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      bottom: 0;
      left: 0;
      text-align: center;
      right: 0;
    }
  }
  > div.infor-wrapper {
    max-width: 228px;
    > span,
    em {
      display: block;
      margin-bottom: 4px;
      color: #777;
      font-weight: 700;
    }
    p {
      overflow: hidden;
      max-height: 36px;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      word-break: normal;
      font-size: 14px;
      line-height: 18px;
      margin-bottom: 5px;
      color: #000;
    }
    em {
      font-size: 12px;
    }
  }
`;
const TableBody = styled.td`
  border-right: 1px solid #e6e6e6;
  &.count {
    text-align: center;
    color: #222;
    font-weight: 500;
    font-size: 14px;
  }
  &.objectCount {
    text-align: center;
    font-size: 14px;
    color: #b5b5b5;
  }
  &.discount {
    text-align: center;

    em {
      display: block;
      font-size: 13px;
      color: #b5b5b5;
      text-decoration: line-through;
    }
    p {
      display: block;
      color: #e02020;
      font-weight: 500;
      margin-top: 3px;
      font-size: 15px;
    }
  }

  &.delivery {
    text-align: center;
    color: #333;
    font-size: 14px;
    font-weight: 800;
    p {
      color: #666;
      font-size: 12px;
      font-weight: 400;
      margin-top: 3px;
    }
  }

  &:last-child {
    border-right: none;
  }
`;
const Container = styled.form`
  padding: 20px;
  margin-top: -20px;
  background-color: #fff;
  z-index: 9;
  position: relative;
  border-radius: 5px;
  div.title-box {
    border-top: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    .gray_btn {
      width: 90px;
    }
  }

  input[type="text"] {
    width: 400px;
    height: 28px;
    border: 1px solid ${({ theme }) => theme.lineColor.sub};
    font-size: 15px;
    color: #131518;
    border-radius: 6px;
    padding: 0px 5px;
    &:focus {
      border-color: #116dff;

      outline: none;
    }
  }
`;
const TableBox = styled.div`
  > div:first-child {
    margin-top: 20px;
  }
  > div:not(:first-child) {
    margin-top: 40px;
  }
  h3 {
    font-weight: 300;
  }

  table {
    margin: 10px 0;
    width: 100%;
    border-top: 1px solid #000;

    tr {
      border-bottom: 1px solid #e6e6e6;
      th {
        padding: 15px;
        width: 170px;
        background: #f4f4f4;
        border-bottom: 1px solid #e6e6e6;
        text-align: left;
        color: #222;
        font-weight: 400;
        font-size: 14px;
      }
      td {
        padding: 15px;
        font-size: 13px;
        border-bottom: 1px solid #e6e6e6;
        input {
          font-size: 13px !important;
        }
        p {
          font-size: 10px;
          margin-top: 5px;
          em {
            color: red;
          }
        }
      }
    }

    .post {
      input[type="text"] {
        width: 120px;

        margin-right: 20px;
      }
      button {
        border: 1px solid #116dff;
        color: #116dff;
        background: #fff;
        width: 100px;
      }
    }

    .address td > div {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
    }
  }
  .objects {
    table {
      table-layout: fixed;
      width: 100%;
    }
    th {
      padding: 10px;
      text-align: center;
    }
  }
  .MuiFormControlLabel-label {
    font-size: 13px;
    color: #000;
  }
  .MuiButtonBase-root {
    padding: 5px;
    &.Mui-checked > span {
      color: #116dff;
    }
  }
`;
const PaymentBox = styled.div`
  display: flex;
  column-gap: 40px;
  > div {
    width: 100%;
  }
  table {
    /* width: 60%; */
  }
  .MuiFormControlLabel-label {
    font-size: 13px;
    color: #000;
  }
`;
const PaymentInfo = styled.div`
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  border-radius: 2px;
  border: 2px solid #000;

  li {
    display: flex;
    padding: 8px 0;
    justify-content: space-between;
    > * {
      color: #222;
      font-size: 14px;
    }
    span {
      font-weight: 600;
      &.color {
        color: #f27370;
      }
    }
  }

  .total {
    /* padding: 10px 0; */
    margin-top: 10px;
    border-top: 1px solid #000;
    li {
      padding: 12px;
      > * {
        font-size: 17px;
        font-weight: 600;
      }
    }
    button {
      width: 100%;
      padding: 15px;
      display: block;
      border-radius: 5px;
      color: #fff;
      font-size: 19px;
      background-color: #f27370;
    }
  }
`;
export default StoreUserPayment;
