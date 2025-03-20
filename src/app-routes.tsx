import { RouteObject } from "react-router-dom";
import AppLayout from "./app-layout";
import React, { useEffect } from "react";
import MainPage from "./pages/main";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import FindId from "./pages/find-id";
import FindPassword from "./pages/find-password";
import StoreList from "./pages/store/store-list";
import { useParams } from "react-router-dom";
import StoreGoodsDetail from "./pages/store/store-goods-detail";
import SearchMain from "./pages/store/search-main";
import StoreBrandDetail from "./pages/store/store-brand-detail";
import StoreHotDeal from "./pages/store/store-hot-deal";
import StoreRankingList from "./pages/store/store-ranking-list";
import StorePlanShopList from "./pages/store/store-plan-shop";
import StoreGoodsSale from "./pages/store/store-goods-sale";
import StoreEvents from "./pages/store/store-events";
import StoreEventDetail from "./pages/store/store-event-detail";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <MainPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "member/find-id",
        element: <FindId />,
      },
      {
        path: "member/find-password",
        element: <FindPassword />,
      },
      {
        path: "store/goods",
        element: <StoreList />,
      },
      {
        path: "store/goods-detail",
        element: <StoreGoodsDetail />,
      },
      {
        path: "store/search-main",
        element: <SearchMain />,
      },
      {
        path: "store/brand-detail",
        element: <StoreBrandDetail />,
      },
      {
        path: "store/hot-deal",
        element: <StoreHotDeal />,
      },
      {
        path: "store/ranking",
        element: <StoreRankingList />,
      },
      {
        path: "store/plan-shop",
        element: <StorePlanShopList />,
      },
      {
        path: "store/goods-sale",
        element: <StoreGoodsSale />,
      },
      {
        path: "store/events",
        element: <StoreEvents />,
      },
      {
        path: "store/event-detail",
        element: <StoreEventDetail />,
      },
    ],
  },
];
export { routes };
