import type { CardImageType } from "compontents/card/card.type";
import { supabase } from "../../supabase";
import { getAuth } from "firebase/auth";
export const addToCart = async ({
  dataInfo,
  addCount = 1,
}: {
  dataInfo: CardImageType;
  addCount: number;
}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const { data: cartInfo, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("userId", user?.uid)
    .eq("object_seq", dataInfo.object_seq);

  if (cartInfo && cartInfo?.length !== 0) {
    const count: number = cartInfo[0]?.object_count + addCount;

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
      if (window.confirm("장바구니 추가되었습니다. 확인하려가실건가요?")) {
        window.location.href = "/";
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
    } else {
      if (window.confirm("장바구니 추가되었습니다. 확인하려가실건가요?")) {
        window.location.href = "/";
      }
    }
  }

  return true;
};
