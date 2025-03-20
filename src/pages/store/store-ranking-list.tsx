import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Center, MainTitle } from "../../../public/assets/style";
import { GubMenu } from "../../app-layout";
import { supabase } from "../../supabase";
import type { CardImageType } from "compontents/card/card.type";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";
import { theme } from "../../../public/assets/styles/theme";
import { useSearchParams } from "react-router-dom";
import EmptyComponent from "../../compontents/EmptyComponent";
import { handleFilter } from "../../bin/common";
import CategoryMenu from "../../compontents/CategoryMenu";
const StoreRankingList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuType = searchParams.get("menuType");
  const [selectedMenu, setSelectedMenu] = useState<string>("전체");
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const handleData = useCallback(async () => {
    let query = supabase.from("objects").select("*");
    if (menuType !== "전체") {
      query = query.eq("objectTypeMain", menuType);
    }
    const { data, error } = await query;
    const filteredData = handleFilter("popular", data ?? []);
    setObjects(filteredData ?? []);
  }, [menuType]);

  useEffect(() => {
    handleData();
    window.scrollTo(0, 0);
  }, [handleData]);
  return (
    <div>
      <MainLine>
        <Center>
          <div>
            <span>랭킹</span>
            <em>오늘의 랭킹! 요즘 가장 핫한 상품</em>
          </div>
        </Center>
      </MainLine>
      <Center>
        <div>
          <CategoryMenu />

          <Container style={objects?.length === 0 ? { display: "unset" } : {}}>
            {objects && objects?.length > 0 ? (
              objects?.map((item, index) => (
                <div key={`fallback=${index}`} className="object_box">
                  <span>{(index + 1).toString().padStart(2, "0")}</span>
                  <ObjectCardColumn size="215px" data={item} />
                </div>
              ))
            ) : (
              <EmptyComponent
                mainText="선택 결과가 없어요"
                subText="랭킹 타입을 다시 선택해주세요"
              />
            )}
          </Container>
        </div>
      </Center>
    </div>
  );
};

export default StoreRankingList;
const CommonMenu = styled.div`
  margin: 35px 0;
  ul {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    li {
      position: relative;
      padding: 0 12px;
      height: 40px;
      font-weight: 700;
      color: #888;
      border: 1px solid #ddd;
      line-height: 40px;
      font-size: 14px;
      margin: -1px 0 0 -1px;
      &.action {
        background: #f65c60;
        color: #fff;
      }
      cursor: pointer;
      &.none {
        cursor: auto;
      }
    }
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 215px);
  justify-content: space-around;
  row-gap: 30px;
  padding-bottom: 50px;
  .object_box {
    position: relative;
    > span {
      width: 48px;
      height: 48px;
      background-color: #fff;
      text-align: center;
      border-radius: 50%;
      line-height: 48px;
      display: block;
      font-size: 20px;
      font-weight: bold;
      color: ${theme.color.main};
      position: absolute;
      left: -22px;
      z-index: 9;
      top: 12px;
      border: 2px solid ${theme.color.main};
      cursor: pointer;
    }
  }
  .best-icon {
    display: none;
  }
  .tags,
  h5 {
    text-align: center;
  }
`;

const MainLine = styled(MainTitle)`
  height: 100px;
  background: url("/public/assets/images/icons/bg_best1_top.png") 50% 0
    no-repeat;

  > div {
    > div {
      padding-top: 30px;
      em,
      span {
      }
    }
  }
`;
