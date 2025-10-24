import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const cartInfo: number[] = [];

const cartDataState = createSlice({
  name: "userCartDataState",
  initialState: cartInfo,
  reducers: {
    setCartItems: (_, action: PayloadAction<number[]>) => {
      return action.payload;
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { setCartItems } = cartDataState.actions;
export default cartDataState.reducer;
