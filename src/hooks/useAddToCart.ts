import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import type { CardImageType } from "@/components/card/card.type";
import { addItemCart } from "@/services/cart";

const CART_ICON_URL =
  "https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/sign/images/shopping.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYTBjYzg1NC1jMWE5LTQ2MTktYTBiNy1iMTdmMGE2ZGE3MWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvc2hvcHBpbmcucG5nIiwiaWF0IjoxNzYxNTQ5NjIxLCJleHAiOjE3OTMwODU2MjF9.oQy-e0T_PPu_HfDoEaqJx3kVKnLzyeQTS5MuOI8VwqY";

export function useAddToCart() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.user.token);

  const handleAddToCart = useCallback(
    async (event: React.MouseEvent, data?: CardImageType) => {
      event.preventDefault();
      event.stopPropagation();

      if (!data) return;

      if (token === "") {
        if (window.confirm("로그인후 이용해주세요\n로그인 하시겠습니까?")) {
          navigate("/login");
        }
        return;
      }

      if (data.soldOut) {
        alert("품절된 상품입니다.");
        return;
      }

      await addItemCart({
        objects: { ...data, addCount: 1 },
        dispatch,
      });
    },
    [token, navigate, dispatch]
  );

  return { handleAddToCart, cartIconUrl: CART_ICON_URL };
}
