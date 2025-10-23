import Cookies from "js-cookie";
import axios, { HttpStatusCode } from "axios";
import { HOST_URL } from "../bin/env";
import { REACT_APP_API_KEY } from "../bin/env";
import { supabase } from "../supabase";
import type { CardImageType } from "compontents/card/card.type";
import moment from "moment";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_KEY;

// 아이디 찾기
export const getFindId = async ({
  name,
  birthDy,
  phoneNumber,
}: {
  name: string;
  birthDy: string;
  phoneNumber: string;
}) => {
  const { data, error } = await supabase
    .from("userInfo")
    .select("*")
    .eq("name", name)
    .eq("birthDy", birthDy)
    .eq("phoneNumber", phoneNumber)
    .single();

  if (error) throw error;

  return data;
};
export const attentionData = async () => {
  const { data, error } = await supabase
    .from("objects")
    .select("*, saleItem(*)")
    .eq("attention", "True");
  if (error) throw error;
  return data;
};

export const weeklyData = async () => {
  const { data, error } = await supabase
    .from("weeklyItems")
    .select(`*,objects:object_seq(*)`);

  if (error) throw error;
  return data;
};

export const brandsData = async () => {
  const { data, error } = await supabase
    .from("brands")
    .select("*,object:objects(*)");

  if (error) throw error;
  return data;
};

export const objectData = async () => {
  const { data, error } = await supabase
    .from("objects")
    .select("*, saleItem(*)");
  // .filter("saleItem.start_sale_date", "lte", today)
  // .filter("saleItem.end_sale_date", "gte", today);
  if (error) throw error;
  const items: CardImageType[] | undefined = data
    ?.slice() // 원본 배열 유지 (안 하면 원본이 변함)
    ?.sort((a, b) => b.view_count - a.view_count) // 내림차순 정렬
    ?.slice(0, 10); // 상위 10개만 추출

  return items;
};

export const newData = async () => {
  const { data, error } = await supabase
    .from("newItems")
    .select(`*,objects:object_seq(*)`);
  if (error) throw error;
  return data;
};

export const recommendData = async () => {
  const { data, error } = await supabase
    .from("objects")
    .select("*, saleItem(*)")
    .eq("recommend", "True");
  //.filter("saleItem.start_sale_date", "lte", today)
  // .filter("saleItem.end_sale_date", "gte", today);
  if (error) throw error;
  return data;
};

export const bannersData = async () => {
  const { data, error } = await supabase
    .from("banners")
    .select(`*,objects:object_seq(*)`);
  if (error) throw error;
  return data;
};

// 리뷰 작성 가능한 데이터 (배송 완료)
export const userCartData = async (userToken: string) => {
  const { data, error } = await supabase
    .from("carts")
    .select("*,objects(*,saleItem(*))")
    .eq("userId", userToken);
  if (error) throw error;
  return data;
};
//장바구니 제품 삭제
export const cartDataDelete = async (userToken: string, seq: number[]) => {
  const { data, error } = await supabase
    .from("carts")
    .delete()
    .eq("userId", userToken)
    .in("object_seq", seq);
  if (error) throw error;
  return data;
};

export const paymentOrderData = async (userToken: string, orderId: string) => {
  const { data, error } = await supabase
    .from("payment")
    .select("*")
    .eq("userId", userToken)
    .eq("orderId", orderId)
    .single();
  if (error) throw error;
  return data;
};

export const paymentOrderCancel = async (userToken: string, id: string) => {
  const { data, error } = await supabase
    .from("payment")
    .update({ paymentCancel: "True" }) // 수정할 값
    .eq("id", id)
    .eq("userId", userToken);
  if (error) throw error;
  return data;
};

export const orderDeliveryData = async (
  userToken: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from("payment")
    .select("*")
    .eq("userId", userToken)
    .gte("created_at", moment.utc(`${startDate}`).add(9, "hours").toISOString())
    .lte("created_at", moment.utc(`${endDate}`).add(9, "hours").toISOString());
  if (error) throw error;
  return data;
};
