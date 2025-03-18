import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 로컬 스토리지
import userState from "./reducers/userReducer";
import cartState from "./reducers/userCartCount";
import recentProductsState from "./reducers/recentProductsData";
import userSearchState from "./reducers/userSearch";
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "cartCount", "recentProducts", "searchData"],
};
const rootReducer = combineReducers({
  user: userState,
  cartCount: cartState,
  recentProducts: recentProductsState,
  searchData: userSearchState,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
// RootState 정의
export type RootState = ReturnType<typeof store.getState>; // store.getState()의 반환값 타입
