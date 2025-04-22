import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
import type { CartType } from "compontents/card/card.type";
const cartInfo: CartType[] = [];

const cartDataState = createSlice({
  name: "userCartDataState",
  initialState: cartInfo,
  reducers: {
    setCartItems: (state: CartType[], action: PayloadAction<CartType[]>) => {
      console.log(action.payload);
      return action.payload;
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { setCartItems } = cartDataState.actions;
export default cartDataState.reducer;
