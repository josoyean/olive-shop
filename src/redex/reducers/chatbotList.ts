import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
interface ChatbotType {
  answer: string;
  question: string;
}
const chatbotInfo: ChatbotType[] = [];

const chatbotState = createSlice({
  name: "chatbotList",
  initialState: chatbotInfo,
  reducers: {
    chatbotAdd: (
      state: ChatbotType[],
      action: PayloadAction<ChatbotType[]>
    ) => {
      return action.payload;
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { chatbotAdd } = chatbotState.actions;
export default chatbotState.reducer;
