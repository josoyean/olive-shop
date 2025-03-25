import react, { useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { RecaptchaVerifier } from "firebase/auth";
import { supabase } from "../supabase";
import { useSelector, useDispatch } from "react-redux";
import type { CardImageType } from "compontents/card/card.type";
// 무한 반복
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
export const handleCartCount = async (token: string) => {
  if (token === "") return 0;
  const { data: cartInfo, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", token);

  if (cartError) {
    console.error("장바구니 조회 실��", cartError);
    return 0;
  }
  return cartInfo?.length ?? 0; // undefined or null일 경우 0 리턴
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
  sale: boolean = true,
  count: number = 0,
  percent: number = 0
) => {
  if (sale) {
    return Math.round(count - count * 0.01 * (percent ?? 0));
  } else {
    return Math.round(count);
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
