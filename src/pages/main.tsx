import React, { useState, ReactNode, useEffect } from "react";
import styled from "styled-components";
import BannerContainer from "./main/banner-container";
import CommendObject from "./main/commend-object";
import { Center } from "../../public/assets/style";
import EventContainer from "./main/event-container";
import HotObject from "./main/hot-object";
import { getProjects, supabase } from "../supabase";
import type { CardImageType } from "compontents/card/card.type";
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

  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)
  //CardImageType
  useEffect(() => {
    const weeklyData = async () => {
      const { data, error } = await supabase
        .from("weeklyItems")
        .select(`*,objects:object_seq(*)`);

      if (error) {
        setWeeklyItems([]);
        return;
      }
      setWeeklyItems(data ?? []);
    };

    const newData = async () => {
      const { data, error } = await supabase
        .from("newItems")
        .select(`*,objects:object_seq(*)`);
      if (error) {
        setNewItems([]);
        return;
      }

      setNewItems(data ?? []);
    };

    const attentionData = async () => {
      const { data, error } = await supabase
        .from("objects")
        .select("*, saleItem(*)")
        .eq("attention", "True")
        .filter("saleItem.start_sale_date", "lte", today)
        .filter("saleItem.end_sale_date", "gte", today);

      setAttentionItems(!data ? [] : data);
    };
    const recommendData = async () => {
      const { data, error } = await supabase
        .from("objects")
        .select("*, saleItem(*)")
        .eq("recommend", "True")
        .filter("saleItem.start_sale_date", "lte", today)
        .filter("saleItem.end_sale_date", "gte", today);
      setRecommendItems(!data ? [] : data);
    };

    const objectData = async () => {
      // const { data, error } = await supabase.from("objects").select("*");
      const { data, error } = await supabase
        .from("objects")
        .select("*, saleItem(*)")
        .filter("saleItem.start_sale_date", "lte", today)
        .filter("saleItem.end_sale_date", "gte", today);
      const items: CardImageType[] | undefined = data
        ?.slice() // 원본 배열 유지 (안 하면 원본이 변함)
        ?.sort((a, b) => b.view_count - a.view_count) // 내림차순 정렬
        ?.slice(0, 10); // 상위 10개만 추출
      setObjectItems(!items ? [] : items);
    };

    newData();
    objectData();
    weeklyData();
    attentionData();
    recommendData();
  }, []);
  return (
    <div>
      <BannerContainer />
      <Center style={{ display: "flex", columnGap: "40px", marginTop: "40px" }}>
        <CommendObject title="요즘 주목 받는 상품" data={attentionItems} />
        <CommendObject title="고객님을 위한 추천 상품" data={recommendItems} />
      </Center>
      <EventContainer title="Weekly Special" images={weeklyItems} />
      <HotObject data={objectItems}></HotObject>
      <EventContainer title="신상 업데이트" images={newItems} />
    </div>
  );
};

export default MainPage;
