import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CardImageType } from "compontents/card/card.type";

const initialState: CardImageType[] = [];

const recentProductsState = createSlice({
  name: "recentProducts",
  initialState,
  reducers: {
    addProducts: (state, action: PayloadAction<CardImageType>) => {
      const updatedProducts = [
        action.payload,
        ...state.filter((id) => id?.object_seq !== action?.payload?.object_seq),
      ];
      // if (updatedProducts.length > 5) {
      //   updatedProducts.length = 5;
      // }

      return updatedProducts;
    },
    clearProducts: () => {
      return []; // 상태 초기값
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const { addProducts, clearProducts } = recentProductsState.actions;
export default recentProductsState.reducer;
