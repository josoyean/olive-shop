import type { CardImageType } from "compontents/card/card.type";
import { supabase } from "../../supabase";
import { getAuth } from "firebase/auth";
import type { AppDispatch } from "../../redex/store";
import { handleCartItems } from "../../bin/common";

interface CartType extends CardImageType {
  addCount: number | undefined;
}
export const addItemCart = async ({
  objects,
  dispatch,
}: {
  objects: CartType;
  dispatch: AppDispatch;
}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const { data: objectInfo } = await supabase
    .from("objects")
    .select("soldOut")
    .eq("object_seq", objects?.object_seq)
    .single();
  if (objectInfo?.soldOut) {
    alert("품절된 상품입니다.");
    return;
  }

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
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요2");
      console.log(error);
      console.log(objects);
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
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요1");
      return;
    }
  }

  handleCartItems(user?.uid, dispatch, true);
};

export const modifyCartItems = async ({
  objects,
  count,
  dispatch,
}: {
  objects: CardImageType;
  count: number;
  dispatch: AppDispatch;
}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const { error } = await supabase
    .from("carts")
    .update({
      object_count: count,
    })
    .eq("userId", user?.uid)
    .eq("object_seq", objects?.object_seq);
  if (error) {
    alert("수량 수정을 다시 시도해주세요");
    return;
  }
  handleCartItems(user?.uid, dispatch);
  return true;
};
