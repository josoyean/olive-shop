import type { CardImageType } from "compontents/card/card.type";
import { supabase } from "../../supabase";
import { getAuth } from "firebase/auth";

export const addToCart = async ({
  dataInfo,
  addCount = 1,
  mode = "add",
}: {
  dataInfo: CardImageType;
  addCount: number;
  mode?: "add" | "update" | undefined;
}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const { data: objectInfo, error: objectError } = await supabase
    .from("objects")
    .select("soldOut")
    .eq("object_seq", dataInfo.object_seq)
    .single();
  if (objectInfo?.soldOut) {
    alert("품절된 상품입니다.");
    return false;
  }

  const { data: cartInfo, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", user?.uid)
    .eq("object_seq", dataInfo.object_seq);

  if (cartInfo && cartInfo?.length !== 0) {
    const count: number =
      mode === "add" ? cartInfo[0]?.object_count + addCount : addCount;

    const { data: existingItem, error } = await supabase
      .from("carts")
      .update({
        object_count: count,
      })
      .eq("userId", cartInfo[0]?.userId)
      .eq("object_seq", cartInfo[0]?.object_seq);
    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요1");
    } else {
      if (mode === "add") {
        if (window.confirm("장바구니 추가되었습니다. 확인하러가실건가요?")) {
          window.location.href = "/store/user-cart?t_header_type=1";
        }
      }
    }
  } else {
    const { data: existingItem, error } = await supabase.from("carts").insert([
      {
        object_count: addCount,
        ...dataInfo,
        created_at: new Date().toISOString(),
        userId: user?.uid, // 사용자 ID 추가
      },
    ]);
    if (error) {
      alert("장바구니 추가 실패했습니다. 다시 시도해주세요2");
      console.log(error);
      console.log(dataInfo);
    } else {
      if (mode === "add") {
        if (window.confirm("장바구니 추가되었습니다. 확인하러가실건가요?")) {
          window.location.href = "/store/user-cart?t_header_type=1";
        }
      }
    }
  }

  return true;
};
