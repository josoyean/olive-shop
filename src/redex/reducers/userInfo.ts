import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserInfoType } from "compontents/card/card.type";
const cartInfo: UserInfoType | null = {};

const userInfoState = createSlice({
  name: "userCartDataState",
  initialState: cartInfo,
  reducers: {
    setUserInfo: (_, action: PayloadAction<UserInfoType>) => {
      return action.payload;
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { setUserInfo } = userInfoState.actions;
export default userInfoState.reducer;
