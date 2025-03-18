import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CardImageType } from "compontents/card/card.type";

interface searchStateType {
  save: boolean;
  searchValue: string[];
}
interface searchType {
  save: boolean;
  searchValue: string;
}
const searchState: searchStateType = {
  save: true,
  searchValue: [],
};

const userSearchState = createSlice({
  name: "userSearch",
  initialState: searchState,
  reducers: {
    addSearchText: (state, action: PayloadAction<searchType>) => {
      const updatedProducts = {
        save: action.payload.save,
        searchValue: [
          action.payload.searchValue,
          ...state.searchValue.filter(
            (id) => id !== action?.payload?.searchValue
          ),
        ],
      };
      if (updatedProducts.searchValue.length > 10) {
        updatedProducts.searchValue.length = 10;
      }

      return updatedProducts;
    },
    deleteSearchText: (state, action: PayloadAction<searchType>) => {
      const updatedProducts = {
        save: action.payload.save,
        searchValue: state?.searchValue.filter(
          (id) => id !== action?.payload?.searchValue
        ),
      };

      return updatedProducts;
    },
    allDeleteSearchText: (state, action: PayloadAction<searchType>) => {
      const updatedProducts = {
        save: action.payload.save,
        searchValue: [],
      };

      return updatedProducts;
    },
    saveToggle: (state, action: PayloadAction<searchType>) => {
      const updatedProducts = {
        save: !action.payload.save,
        searchValue: state?.searchValue,
      };

      return updatedProducts;
    },
  },
});

// 액션 생성자와 리듀서를 내보냄
export const {
  addSearchText,
  deleteSearchText,
  allDeleteSearchText,
  saveToggle,
} = userSearchState.actions;
export default userSearchState.reducer;
