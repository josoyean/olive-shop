import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
import type { UserInfoType } from "compontents/card/card.type";
const cartInfo: UserInfoType | null = {};

const userInfoState = createSlice({
  name: "userCartDataState",
  initialState: cartInfo,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoType>) => {
      return action.payload;
    },
    deleteUserInfo: (state) => {
      return {};
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { setUserInfo, deleteUserInfo } = userInfoState.actions;
export default userInfoState.reducer;
