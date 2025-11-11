import { useEffect, useRef } from "react";
import { RecaptchaVerifier } from "firebase/auth";
import { supabase } from "../supabase";

import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { CardImageType, SaleType } from "compontents/card/card.type";
import moment from "moment";
import { setCartItems } from "../redex/reducers/userCartData";
import { setUserInfo } from "../redex/reducers/userInfo";
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
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
export const setupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    return;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible", // reCAPTCHA v2 (보이지 않는) 방식
      callback: (response: string) => {
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

  dispatch(setCartItems(userCartInfo.map((item) => item.object_seq) ?? []));
  if (movePage) {
    if (window.confirm("장바구니 추가되었습니다. 확인하러가실건가요?")) {
      window.location.href = "/store/mypage/user-cart?t_header_type=1";
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
    const betweenToday = moment(today).isBetween(
      sale?.start_today_sale_date,
      sale?.end_today_sale_date,
      "day"
    );
    const percent =
      (betweenDay ? sale?.discount_rate || 0 : 0) +
      (betweenToday ? sale?.today_discount_rate || 0 : 0);

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

export const handleSaleTF = (sale: SaleType | null | undefined) => {
  if (!sale) return false;
  const betweenDay = moment(today).isBetween(
    sale?.start_sale_date,
    sale?.end_sale_date
  );
  return betweenDay;
};

export const getUserInfo = async (token: string, dispatch: AppDispatch) => {
  try {
    const usersRef = collection(db, "users"); // users 컬렉션 참조 installment
    const id = query(usersRef, where("userId", "==", token));

    // 특정 이메일 찾기
    const idSnapshot = await getDocs(id);

    if (!idSnapshot.empty) {
      const data = idSnapshot.docs[0].data();
      delete data.createdAt;
      dispatch(setUserInfo(data));
      return data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const isEmptyObject = (object: object) => {
  return Object.keys(object).length === 0;
};

export const isToday = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)

export const defaultProfile =
  "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAZAAD/4QMvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5QUYxNTc3QkIxREExMUU5QjlFN0ZBQkY1MDg0NDFGMCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5QUYxNTc3Q0IxREExMUU5QjlFN0ZBQkY1MDg0NDFGMCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlBRjE1Nzc5QjFEQTExRTlCOUU3RkFCRjUwODQ0MUYwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlBRjE1NzdBQjFEQTExRTlCOUU3RkFCRjUwODQ0MUYwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAEQ0NDQ4NEg4OEhoRDxEaHxcSEhcfIhcXFxcXIiMbHh0dHhsjIykqLSopIzY2Ozs2NkFBQUFBQUFBQUFBQUFBQQESEREUFhQYFRUYFxMXExcdFxkZFx0sHR0gHR0sOCgjIyMjKDgyNS0tLTUyPT04OD09QUFBQUFBQUFBQUFBQUFB/8AAEQgAbgBuAwEiAAIRAQMRAf/EAGIAAQEBAQEBAAAAAAAAAAAAAAADAgQBBgEBAAAAAAAAAAAAAAAAAAAAABAAAgEDAwQBBQEAAAAAAAAAAAECETEDIUESUWEiQoFxkaEyE7ERAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APvAAAMylGN2YyZeOkbkG23V6sCss79V9zDyTd2zIAVbuE2rMADSyzW9fqUjnXsqd0RAHWmmqrVHpyRlKLqjohNTXR7oDYAAEsuTj4q+5uUuMWzlbbdXdgAAAAKwhGMec/hASUZOybDTV1Qq879Vp3PVmUtJrQCIN5MfHVfqzAAJtOquAB1Qmpqu+5o5YS4yrtudQEM8tVH5JGsjrNvuZAAAD2CrJLubzPyS2RiLpJPoymaOqlswJAAC0PLE09iJaK4Ym3uRAAAAVUm8L6rQkai/GS6pf6Bl6uoDVG0AAAAFsbco8ZKq6iMIwXKd+hmWaT/XRAaeBbM9jhitXqRc5v2Z6pzW7A1llJujVErEyscqlpNfJ5kx8fKOsQJgAAAEr9gNZVSb76mS2eOil00ZEAVxRSTm7KxItl8YKCAlOTk6v4R4AAAAArin6OzsSAGskeMqbbGS2TyxqZEAaivCb+i/Jkvwf8uO71Ao0mqOzOWUXF0Z1mJwU13VmBzRpyVbVKZpJyVHVJE2mnR3AAAAAAAAAFYyj/Jxb12RIGoQc3RW3YHuKHKVXZHSeJKKorHoAAAZnBTWt+pzyhKN7dTqAHGCslhbvR9jDjHaSfwwMgBLvQADSjDef2TKw/l66vuBOGKUtXojoSUVRWPQAAAH/9k=";

export const getStarWidth = (index: number, score: number) => {
  if (score >= index + 1) return "100%"; // 꽉 찬 별
  if (score > index && score < index + 1) {
    const decimal = score - index;
    return `${decimal * 100}%`; // 일부만 채운 별
  }
  return "0%"; // 비어있는 별
};

export const handleObjects = async (
  info: number[]
): Promise<CardImageType[]> => {
  let query = supabase.from("objects").select("*,saleItem(*)");
  query = query.in("object_seq", info);
  const { data } = await query;

  return data || [];
};
