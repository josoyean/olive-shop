import type { CardImageType } from "@/components/card/card.type";
import { supabase } from "@/supabase";
import { getAuth } from "firebase/auth";
import type { AppDispatch } from "@/redux/store";
import { handleCartItems } from "@/utils/common";

interface CartItem extends CardImageType {
  addCount: number | undefined;
}

async function checkSoldOut(objectSeq?: number): Promise<boolean> {
  if (!objectSeq) return false;

  const { data } = await supabase
    .from("objects")
    .select("soldOut")
    .eq("object_seq", objectSeq)
    .single();

  if (data?.soldOut) {
    alert("품절된 상품입니다.");
    return true;
  }
  return false;
}

async function upsertCartItem(
  userId: string,
  objects: CartItem
): Promise<boolean> {
  const { data: cartInfo } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", userId)
    .eq("object_seq", objects.object_seq!)
    .single();

  if (!cartInfo) {
    const { saleItem, addCount, ...cleanedObject } = objects;
    if (!addCount || !saleItem) return false;

    const { error } = await supabase.from("carts").insert([
      {
        object_count: addCount,
        ...cleanedObject,
        created_at: new Date().toISOString(),
        userId,
      },
    ]);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요.");
      console.error(error);
      return false;
    }
  } else {
    const count = cartInfo.object_count + (objects.addCount ?? 0);
    const { error } = await supabase
      .from("carts")
      .update({ object_count: count })
      .eq("userId", userId)
      .eq("object_seq", objects.object_seq!);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요.");
      return false;
    }
  }

  return true;
}

export async function addItemCart({
  objects,
  dispatch,
}: {
  objects: CartItem;
  dispatch: AppDispatch;
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  if (await checkSoldOut(objects.object_seq)) return;

  const success = await upsertCartItem(user.uid, objects);
  if (success) {
    handleCartItems(user.uid, dispatch, true);
  }
}

export async function addToCart({
  dataInfo,
  addCount = 1,
  mode = "add",
  showConfirm = true,
}: {
  dataInfo: CardImageType;
  addCount: number;
  mode?: "add" | "update";
  showConfirm?: boolean;
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return false;

  if (await checkSoldOut(dataInfo.object_seq)) return false;

  const { data: cartInfo } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", user.uid)
    .eq("object_seq", dataInfo.object_seq!);

  if (cartInfo && cartInfo.length !== 0) {
    const count =
      mode === "add" ? cartInfo[0].object_count + addCount : addCount;

    const { error } = await supabase
      .from("carts")
      .update({ object_count: count })
      .eq("userId", cartInfo[0].userId)
      .eq("object_seq", cartInfo[0].object_seq);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요.");
      return false;
    }
  } else {
    const { saleItem, ...cleanedObject } = dataInfo;
    const { error } = await supabase.from("carts").insert([
      {
        object_count: addCount,
        ...cleanedObject,
        created_at: new Date().toISOString(),
        userId: user.uid,
      },
    ]);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요.");
      console.error(error);
      return false;
    }
  }

  if (mode === "add" && showConfirm) {
    if (window.confirm("장바구니 추가되었습니다. 확인하러가실건가요?")) {
      window.location.href = "/store/mypage/user-cart?t_header_type=1";
    }
  }

  return true;
}

export async function modifyCartItems({
  objects,
  count,
  dispatch,
}: {
  objects: CardImageType;
  count: number;
  dispatch: AppDispatch;
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const { error } = await supabase
    .from("carts")
    .update({ object_count: count })
    .eq("userId", user.uid)
    .eq("object_seq", objects.object_seq!);

  if (error) {
    alert("수량 수정을 다시 시도해주세요");
    return;
  }

  handleCartItems(user.uid, dispatch);
  return true;
}
