import React, { useState, ReactNode, useEffect } from "react";

import BannerContainer from "./main/banner-container";
import CommendObject from "./main/commend-object";
import { Center } from "../../public/assets/style";
import EventContainer from "./main/event-container";
import HotObject from "./main/hot-object";
import type { BrandType, CardImageType } from "compontents/card/card.type";
import BrandsContainer from "./main/brands-container";
import {
  attentionData,
  brandsData,
  newData,
  objectData,
  recommendData,
  weeklyData,
} from "../api/axios-index";
export interface EventImagesType {
  img: string;
  mainText: ReactNode;
  subText: string;
  created_at: string;
  object_seq: number;
  id: number;
  objects?: CardImageType;
}

const MainPage: React.FC = () => {
  const [weeklyItems, setWeeklyItems] = useState<EventImagesType[]>([]);
  const [newItems, setNewItems] = useState<EventImagesType[]>([]);
  const [attentionItems, setAttentionItems] = useState<CardImageType[]>([]);
  const [recommendItems, setRecommendItems] = useState<CardImageType[]>([]);
  const [objectItems, setObjectItems] = useState<CardImageType[]>([]);
  const [brandsItems, setBrandsItems] = useState<BrandType[]>([]);

  //CardImageType
  useEffect(() => {
    //신상 업데이트
    newData()
      .then((data) => {
        setNewItems(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });

    //조회 급상승, 인기템
    objectData()
      .then((data) => {
        setObjectItems(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });

    //고객님을 위한 추천 상품
    recommendData()
      .then((data) => {
        setRecommendItems(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });

    // 주목해야 할 브랜드
    brandsData()
      .then((data) => {
        setBrandsItems(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });
    //Weekly Special
    weeklyData()
      .then((data) => {
        setWeeklyItems(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });

    //요즘 주목 받는 상품
    attentionData()
      .then((data) => {
        setAttentionItems(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <div role="region" aria-label="메인 콘텐츠">
      <BannerContainer />
      <Center style={{ display: "flex", columnGap: "40px", marginTop: "40px" }}>
        <CommendObject title="요즘 주목 받는 상품" data={attentionItems} />
        <CommendObject title="고객님을 위한 추천 상품" data={recommendItems} />
      </Center>
      <EventContainer title="Weekly Special" images={weeklyItems} />
      <HotObject data={objectItems}></HotObject>
      <BrandsContainer title="주목해야 할 브랜드" data={brandsItems} />
      <EventContainer title="신상 업데이트" images={newItems} />
    </div>
  );
};

export default MainPage;
