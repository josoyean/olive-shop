import type { CardImageType } from "@/components/card/card.type";
import { supabase } from "@/supabase";
import { getAuth } from "firebase/auth";
import type { AppDispatch } from "@/redux/store";
import { handleCartItems } from "@/utils/common";

interface CartItem extends CardImageType {
  addCount: number | undefined;
}

/** brands/saleItem 등 관계 객체는 제외하고 carts 컬럼만 insert */
function toCartInsertRow(
  dataInfo: CardImageType,
  userId: string,
  objectCount: number,
) {
  return {
    userId,
    name: dataInfo.name ?? "",
    img: dataInfo.img ?? "",
    detailImg: dataInfo.detailImg ?? "",
    subImg: dataInfo.subImg ?? [],
    sale: dataInfo.sale ?? false,
    discount_rate: dataInfo.discount_rate ?? 0,
    count: dataInfo.count ?? 0,
    best: dataInfo.best ?? false,
    attention: dataInfo.attention ?? false,
    recommend: dataInfo.recommend ?? false,
    coupon: dataInfo.coupon ?? false,
    option: dataInfo.option ?? false,
    soldOut: dataInfo.soldOut ?? false,
    one_more: dataInfo.one_more ?? null,
    view_count: dataInfo.view_count ?? 0,
    objectTypeMain: dataInfo.objectTypeMain ?? "",
    objectTypeSub: dataInfo.objectTypeSub ?? "",
    created_at: new Date().toISOString(),
    object_seq: dataInfo.object_seq,
    brand: dataInfo.brand ?? "",
    brand_seq: dataInfo.brand_seq,
    object_count: objectCount,
  };
}

async function checkSoldOut(objectSeq?: number): Promise<boolean> {
  if (!objectSeq) return false;

  const { data } = await supabase
    .from("objects")
    .select("soldOut")
    .eq("object_seq", objectSeq)
    .maybeSingle();

  if (data?.soldOut) {
    alert("품절된 상품입니다.");
    return true;
  }
  return false;
}

async function upsertCartItem(
  userId: string,
  objects: CartItem,
): Promise<boolean> {
  const addCount =
    objects.addCount && objects.addCount > 0 ? objects.addCount : 1;

  // 장바구니에 이미 있는지 확인 (0건이면 null)
  const { data: cartInfo } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", userId)
    .eq("object_seq", objects.object_seq!)
    .maybeSingle();

  if (!cartInfo) {
    // 없으면 새로 추가
    const { error } = await supabase
      .from("carts")
      .insert([toCartInsertRow(objects, userId, addCount)]);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요.");
      console.error(error);
      return false;
    }
  } else {
    // 있으면 수량만 추가
    const count = (cartInfo.object_count ?? 0) + addCount;
    const { error } = await supabase
      .from("carts")
      .update({ object_count: count })
      .eq("userId", userId)
      .eq("object_seq", objects.object_seq!);

    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요.");
      console.error(error);
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
    const { error } = await supabase
      .from("carts")
      .insert([toCartInsertRow(dataInfo, user.uid, addCount)]);

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
