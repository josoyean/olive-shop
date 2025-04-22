import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Center } from "../../../public/assets/style";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  CardImageType,
  BrandType,
  filteredSearch,
} from "../../compontents/card/card.type";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";
import { handleFilter } from "../../bin/common";

const SearchMain = () => {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchValue = searchParams.get("getSearchValue");
  const [brandYN, setBrandYN] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | undefined>(
    filteredSearch[0].type
  );
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const [objectsList, setObjectsList] = useState<CardImageType[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandType>({});
  const handleData = async (value: string) => {
    const { data: brandData } = await supabase
      .from("brands")
      .select("*")
      .eq("name", value)
      .single();

    const seq = brandData?.brand_seq;
    if (brandData) {
      //브랜드 종류 있을때
      setBrandInfo(brandData);
      const { data: nameData } = await supabase
        .from("objects")
        .select("*,saleItem(*)")
        .eq("brand_seq", seq);
      // .filter("saleItem.start_sale_date", "lte", today)
      // .filter("saleItem.end_sale_date", "gte", today);
      setObjects(nameData ?? []);
      setBrandYN(true);
      const filterData = handleFilter("popular", nameData ?? []);
      setObjectsList(filterData);
    } else {
      // 브랜드 종류 없을때
      const { data: nameData } = await supabase
        .from("objects")
        .select("*")
        .ilike("name", `%${value}%`);
      setBrandYN(false);
      const filterData = handleFilter("popular", nameData ?? []);
      setObjectsList(filterData);
      setObjects(nameData ?? []);
    }
  };
  useEffect(() => {
    handleData(searchValue ?? "");
  }, [searchValue]);

  return (
    <Center>
      <Container>
        <h1>'{searchValue || " "}'에 대한 검색결과</h1>
        {!searchValue || objects?.length === 0 ? (
          <NoData>
            <img src="/public/assets/images/icons/no_data.svg" alt="no_data" />
            <p>검색 결과가 없어요</p>
            <span>
              철자를 확인하거나 <br />
              다른 키워드로 검색해보세요
            </span>
          </NoData>
        ) : (
          <>
            {brandYN && (
              <BrandBox
                onClick={(event) => {
                  event.preventDefault();
                  navigate(
                    `/store/brand-detail?getBrand=${brandInfo?.brand_seq}`
                  );
                }}
              >
                <img src={brandInfo?.brandImg} alt="브랜드 대표 이미지" />
                <div>
                  <p>브랜드관</p>
                  <span>
                    <em>{brandInfo?.name}</em>
                    {" 바로가기 >"}
                  </span>
                </div>
              </BrandBox>
            )}
            <ObjectsBox>
              <div className="tBox">
                <h3>총 {objects?.length}개</h3>
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
                        const filterData = handleFilter(
                          item?.type ?? "popular",
                          objects ?? []
                        );
                        setObjectsList(filterData);
                        setSelected(item?.type);
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bBox">
                {objectsList &&
                  objectsList?.map((list, index) => (
                    <ObjectCardColumn
                      key={index}
                      size="229px"
                      option={false}
                      data={list && list}
                    />
                  ))}
              </div>
            </ObjectsBox>
          </>
        )}
      </Container>
    </Center>
  );
};
const NoData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* margin-top: 150px; */
  height: 450px;
  img {
    width: 100px;
    height: 100px;
  }
  p {
    font-weight: 700;
    color: #131518;
    font-size: 20px;
    line-height: 29px;
    margin-bottom: 12px;
  }
  span {
    color: #757d86;
    text-align: center;
    font-size: 16px;
    line-height: 22px;
  }
`;
const BrandBox = styled.div`
  cursor: pointer;
  width: 100%;
  padding: 15px 14px;
  display: flex;
  align-items: center;
  column-gap: 20px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.lineColor.main};
  img {
    overflow: hidden;
    border-radius: 3px;
    width: 204px;
    object-fit: cover;
    height: 80px;
  }
  > div {
    /* display: flex; */
    /* flex-direction: column; */
    p {
      color: #757d86;
      font-size: 14px;
      line-height: 17px;
    }
    span {
      color: #131518;
      font-size: 18px;
      line-height: 26px;
      margin-top: 2px;
      padding-right: 14px;
      display: flex;
      column-gap: 6px;
      align-items: center;
    }
    em {
      font-weight: 700;
    }
  }
`;
const ObjectsBox = styled.div`
  border-top: 1px solid ${({ theme }) => theme.lineColor.main};
  border-bottom: 1px solid ${({ theme }) => theme.lineColor.main};
  padding: 25px 0;
  margin: 45px 0;
  > .tBox {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter {
      display: flex;
      column-gap: 15px;
      align-items: center;
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
  }

  .bBox {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px 33px;
    margin-top: 40px;
  }
`;
const Container = styled.div`
  h1 {
    /* display: block; */
    margin: 40px 0;
  }
`;
export default SearchMain;
