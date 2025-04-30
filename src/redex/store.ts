import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 로컬 스토리지
import userState from "./reducers/userReducer";
import cartState from "./reducers/userCartCount";
import recentProductsState from "./reducers/recentProductsData";
import userSearchState from "./reducers/userSearch";
import cartDataState from "./reducers/userCartData";
import userInfoState from "./reducers/userInfo";
const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "user",
    "cartCount",
    "recentProducts",
    "searchData",
    "cartDate",
    "userInfo",
  ],
};
const rootReducer = combineReducers({
  user: userState,
  cartCount: cartState,
  recentProducts: recentProductsState,
  searchData: userSearchState,
  cartDate: cartDataState,
  userInfo: userInfoState,
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
export type AppDispatch = typeof store.dispatch;
