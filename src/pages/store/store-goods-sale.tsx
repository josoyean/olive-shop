import React, { useCallback, useEffect, useState } from "react";
import { Center, MainTitle } from "../../../public/assets/style";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import CategoryMenu from "../../compontents/CategoryMenu";
import { supabase } from "../../supabase";
import { handleFilter } from "../../bin/common";
import { theme } from "../../../public/assets/styles/theme";
import {
  filteredSearch,
  type CardImageType,
} from "../../compontents/card/card.type";
import EmptyComponent from "../../compontents/EmptyComponent";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";
import ModalContainer from "../../compontents/ModalContainer";
const StoreGoodsSale = () => {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)
  const [searchParams, setSearchParams] = useSearchParams();
  const menuType = searchParams.get("menuType");
  const tabsType = searchParams.get("tabsType");

  const [selected, setSelected] = useState<string | undefined>(
    filteredSearch[0].type
  );
  const [objectsList, setObjectsList] = useState<CardImageType[]>([]);

  const handleLoadData = useCallback(async () => {
    let query = supabase.from("objects").select("*,saleItem(*)");

    if (menuType !== "전체") {
      query = query.eq("objectTypeMain", menuType);
    }

    if (tabsType === "핫인기세일") {
      query = query.is("saleItem.one_more", null);
    } else {
      query = query.in("saleItem.one_more", [1, 2]);
    }
    //세일
    if (tabsType === "핫인기세일") {
      query = query
        .filter("saleItem.start_sale_date", "lte", today)
        .filter("saleItem.end_sale_date", "gte", today);
    }

    const { data } = await query;
    console.log(data?.filter((item) => item.saleItem) ?? []);
    console.log(data);
    const filteredData = handleFilter(
      "popular",
      data?.filter((item) => item.saleItem) ?? []
    );
    console.log(filteredData);
    setObjectsList(filteredData ?? []);
  }, [tabsType, menuType, selected]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <div>
      <MainLine>
        <Center>
          <div>
            <span>세일</span>
            <em>핫 세일! 이건 꼭 사야 해!</em>
          </div>
        </Center>
      </MainLine>
      <Center>
        <div>
          <Tabs>
            <div className={tabsType === "핫인기세일" ? "on" : ""}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setSelected("popular");
                  setSearchParams({
                    menuType: "전체",
                    tabsType: "핫인기세일",
                  });
                }}
              >
                핫인기 세일
              </button>
            </div>
            <div className={tabsType === "증정하나더" ? "on" : ""}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setSelected("popular");
                  setSearchParams({
                    menuType: "전체",
                    tabsType: "증정하나더",
                  });
                }}
              >
                증정/하나 더
              </button>
            </div>
          </Tabs>
          <CategoryMenu style={{}} />
          {objectsList && objectsList?.length > 0 ? (
            <Container>
              <h2>
                전체 <span>{objectsList?.length}</span>개의 상품이 등록되어
                있습니다
              </h2>
              <div className="filter">
                {filteredSearch?.map((item) => (
                  <span
                    key={item.type}
                    style={
                      item.type === (selected ?? "popular")
                        ? { fontWeight: "bold" }
                        : {}
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      setSelected(item.type);
                      // const filteredData = handleFilter(
                      //   item.type ?? "popular",
                      //   objectsList ?? []
                      // );

                      // setObjectsList(filteredData);
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="object">
                {objectsList?.map((object) => (
                  <ObjectCardColumn
                    size="230px"
                    data={object}
                    key={object?.object_seq}
                  />
                ))}
              </div>
            </Container>
          ) : (
            <EmptyComponent
              mainText="선택 결과가 없어요"
              subText="세일 목록을 다시 선택해주세요"
            />
          )}
        </div>
      </Center>

      <ModalContainer>안녕</ModalContainer>
    </div>
  );
};

export default StoreGoodsSale;
const Container = styled.div`
  h2 {
    text-align: center;
    font-weight: 350;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    margin-bottom: 25px;
    span {
      color: ${theme.color.main};
    }
  }

  .filter {
    display: flex;
    column-gap: 15px;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 25px;
    border-bottom: 1px solid #ddd;
    /* justify-content: flex-end; */
    img {
      cursor: pointer;
    }
    span {
      cursor: pointer;
      position: relative;
      display: block;
      font-size: ${({ theme }) => theme.fontSize.small};
      color: ${({ theme }) => theme.fontColor.sub};
      &::after {
        display: block;
        right: -8px;
        top: 0;
        position: absolute;
        content: " | ";
        font-weight: 400;
      }
      &:last-child::after {
        display: none;
      }
    }
  }

  .object {
    display: grid;
    grid-template-columns: repeat(4, 230px);
    row-gap: 40px;
    justify-content: space-between;
    margin-bottom: 50px;
    margin: 40px 0;
    h5,
    .tags {
      text-align: center;
    }
  }
`;

const MainLine = styled(MainTitle)`
  height: 100px;
  background: url("/public/assets/images/icons/bg_sale_top.png") 50% 0 no-repeat;

  > div {
    > div {
      padding-top: 30px;
      em,
      span {
        color: #000;
      }
    }
  }
`;
const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 30px 0 40px;
  > div {
    text-align: center;

    position: relative;
    button {
      height: 50px;
      line-height: 50px;
      background: #f6f6f6;
      color: #666;
      font-size: 18px;
      font-weight: 400;
      width: 100%;
    }

    &.on {
      button {
        color: #fff;
        background: #555;
        &::after {
          position: absolute;
          content: "";
          bottom: -5px;
          left: 50%;
          width: 12px;
          height: 5px;
          margin-left: -6px;
          background: url(https://static.oliveyoung.co.kr/pc-static-root/image/comm/bg_tab_arrow.png)
            no-repeat;
        }
      }
    }
  }
`;
