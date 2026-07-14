import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CardImageType } from "components/card/card.type";

const MAX_RECENT_PRODUCTS = 12;

const initialState: CardImageType[] = [];

const recentProductsState = createSlice({
  name: "recentProducts",
  initialState,
  reducers: {
    addProducts: (state, action: PayloadAction<CardImageType>) => {
      const next = [
        action.payload,
        ...state.filter(
          (item) => item?.object_seq !== action.payload?.object_seq
        ),
      ];
      return next.slice(0, MAX_RECENT_PRODUCTS);
    },
    removeProduct: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload == null) return state;
      return state.filter((item) => item?.object_seq !== action.payload);
    },
    clearProducts: () => [],
  },
});

export const { addProducts, removeProduct, clearProducts } =
  recentProductsState.actions;
export default recentProductsState.reducer;
