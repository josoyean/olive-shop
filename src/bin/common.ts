import react, { useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { RecaptchaVerifier } from "firebase/auth";
import { supabase } from "../supabase";
import { useSelector, useDispatch } from "react-redux";
import type { CardImageType, SaleType } from "compontents/card/card.type";
import moment from "moment";
import { setCartItems } from "../redex/reducers/userCartData";
import type { AppDispatch } from "../redex/store";
// 무한 반복
const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)
export const useInterval = (callback: () => void, delay: number) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export const numberOnly = (value: string = "") => {
  return value?.replace(/[^0-9.]/g, "");
};

export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/^(\d{2,3})(\d{4})(\d{4})$/, "+82 $1-$2-$3");
};

// reCAPTCHA 적용

export const setupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    return;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible", // reCAPTCHA v2 (보이지 않는) 방식
      callback: (response) => {
        console.log("reCAPTCHA solved", response);
      },
      "expired-callback": () => console.log("reCAPTCHA 만료됨"),
    }
  );
};

// 장바구니 갯수 구하기
export const handleCartCount = async (token: string, dispatch: AppDispatch) => {
  if (token === "") return 0;

  const { data: cartInfo, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", token);

  console.log(cartInfo);
  if (cartError) {
    console.error("장바구니 조회 실��", cartError);
    return 0;
  }

  return cartInfo?.length ?? 0; // undefined or null일 경우 0 리턴
};

export const handleCartItems = async (
  token: string,
  dispatch: AppDispatch,
  movePage: boolean = false
) => {
  const { data: userCartInfo, error: cartError } = await supabase
    .from("carts")
    .select("*,objects(*,saleItem(*))")
    .eq("userId", token);

  if (cartError) {
    console.error("장바구니 조회 실��", cartError);
    return;
  }

  dispatch(setCartItems(userCartInfo ?? []));
  if (movePage) {
    if (window.confirm("장바구니 추가되었습니다. 확인하러가실건가요?")) {
      window.location.href = "/store/user-cart?t_header_type=1";
    }
  }
};
export const handleFilter = (type: string, objects: CardImageType[]) => {
  if (type === "lowPrice") {
    const items: CardImageType[] = (objects ?? [])?.sort(
      (a, b) =>
        (a.count ?? 0) -
        (a.count ?? 0) * 0.01 * (a.discount_rate ?? 0) -
        ((b.count ?? 0) - (b.count ?? 0) * 0.01 * (b.discount_rate ?? 0))
    );
    return items;
  } else if (type === "highPrice") {
    const items: CardImageType[] = (objects ?? [])?.sort(
      (a, b) =>
        (b.count ?? 0) -
        (b.count ?? 0) * 0.01 * (b.discount_rate ?? 0) -
        ((a.count ?? 0) - (a.count ?? 0) * 0.01 * (a.discount_rate ?? 0))
    );
    return items;
  } else if (type === "sale") {
    const items: CardImageType[] = (objects ?? [])?.sort(
      (a, b) => (b?.discount_rate ?? 0) - (a?.discount_rate ?? 0)
    );
    return items;
  } else {
    const items: CardImageType[] = (objects ?? [])?.sort(
      (a, b) => (b?.view_count ?? 0) - (a?.view_count ?? 0)
    );
    return items;
  }
};

export const handlePrice = (
  sale: SaleType | null = null,
  count: number = 0
) => {
  if (!sale) {
    return Math.round(count);
  } else {
    const betweenDay = moment(today).isBetween(
      sale?.start_sale_date,
      sale?.end_sale_date,
      "day"
    );

    const percent =
      (betweenDay ? sale?.discount_rate || 0 : 0) +
      (sale?.today_sale_date === today ? sale?.today_discount_rate || 0 : 0);

    return Math.round(count - count * 0.01 * (percent ?? 0));
  }
};

//  행사 이벤트 적용
export const calculatePrice = (
  buyCount: number,
  oneMore: number | null | undefined,
  price: number
) => {
  if (!oneMore) return buyCount * price;

  if (oneMore === 1) {
    return ((buyCount % 2 === 0 ? buyCount : buyCount + 1) / 2) * price;
  } else if (oneMore === 2) {
    return Math.round((buyCount - Math.floor(buyCount / 3)) * price);
  }
};
//  행사 이벤트 적용
export const calculatePriceNY = (
  buyCount: number,
  oneMore: number | null | undefined
) => {
  if (!oneMore) return false;

  if (oneMore === 1) {
    return buyCount % 2 === 0 ? false : true;
  } else if (oneMore === 2) {
    return buyCount % 3 === 2 ? true : false;
  }
};
export const randomOrderId = () => {
  // 사용 가능한 문자 집합
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
  let orderId = "";

  // 각 자리마다 랜덤하게 선택
  for (let i = 0; i < Math.floor(Math.random() * 65 + 6); i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    orderId += chars.charAt(randomIndex);
  }

  return orderId;
};
