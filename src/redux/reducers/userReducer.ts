import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfoType {
  token: string;
  saveId: boolean;
  userId?: string;
}

const userInfo: UserInfoType = {
  token: "",
  saveId: false,
  userId: "",
};

const userState = createSlice({
  name: "user",
  initialState: userInfo,
  reducers: {
    add: (state, action: PayloadAction<UserInfoType>) => {
      state.token = action.payload.token;
      state.saveId = action.payload.saveId;
      state.userId = action.payload.saveId ? action.payload.userId : "";
    },
    deleteUser: (state) => {
      state.token = "";
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { add, deleteUser } = userState.actions;
export default userState.reducer;
