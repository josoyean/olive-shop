import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
const cartInfo: number = 0;

const cartState = createSlice({
  name: "cartCount",
  initialState: cartInfo,
  reducers: {
    modify: (state: number, action: PayloadAction<number>) => {
      return action.payload;
    },
    deleteCart: (state: number, action: PayloadAction<number>) => {
      state = state - action.payload;
      return state;
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { modify, deleteCart } = cartState.actions;
export default cartState.reducer;
