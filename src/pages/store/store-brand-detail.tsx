import { useCallback, useEffect, useState } from "react";
import { Center, ObjectsBox } from "../../../public/assets/style";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  filteredSearch,
  type BrandType,
  type CardImageType,
} from "../../compontents/card/card.type";
import YouTube, { YouTubeProps } from "react-youtube";
import { handleFilter } from "../../bin/common";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";

const StoreBrandDetail = () => {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get("getBrand");
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const [objectsList, setObjectsList] = useState<CardImageType[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandType | null>(null);
  const [selected, setSelected] = useState<string | undefined>(
    filteredSearch[0].type
  );
  const [objectsFilter, setObjectsFilter] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("전체");
  const handleData = async (value: string) => {
    // api 요청 - 브랜드 종류
    const { data: brandData } = await supabase
      .from("brands")
      .select("*")
      .eq("brand_seq", value)
      .single();
    setBrandInfo(brandData);

    const { data: nameData } = await supabase
      .from("objects")
      .select("*,saleItem(*)")
      .eq("brand_seq", value)
      .filter("saleItem.start_sale_date", "lte", today)
      .filter("saleItem.end_sale_date", "gte", today);
    setObjects(nameData ?? []);

    const data = nameData?.map((item) => item?.objectTypeMain).sort();
    setObjectsFilter(["전체", ...new Set(data)]);
    handleType("전체", selected, nameData ?? []);
  };

  useEffect(() => {
    if (!searchParam) return;
    handleData(searchParam);
    setSelectedType("전체");
  }, [searchParam]);

  const opts: YouTubeProps["opts"] = {
    height: "394",
    width: "700",
    playerVars: {
      modestbranding: 1,
      autoplay: 1,
      rel: 0,
      controls: 0,
      loop: 0,
      mute: 1,
      cc_load_policy: 0,
    },
  };

  const handleType = useCallback(
    (
      item: string = "전체",
      selected: string = "",
      objects: CardImageType[]
    ) => {
      if (item === "전체") {
        const filterData = handleFilter(selected ?? "", objects ?? []);
        setObjectsList(filterData);
      } else {
        const test = objects.filter((data) => data.objectTypeMain === item);
        const filterData = handleFilter(selected ?? "", test ?? []);

        setObjectsList(filterData);
      }
      setSelectedType(item);
      setSelected(selected);
    },
    [selected, selectedType]
  );
  return (
    <Center>
      <Container role="region" aria-label="브랜드 상세">
        <TitleContainer>{brandInfo?.name}</TitleContainer>
        <InfoContainer>
          <div className="img-box">
            <img src={brandInfo?.brandImg} alt="브랜드 소개 이미지" />
            <span>{brandInfo?.infoMainText}</span>
          </div>
          <span
            dangerouslySetInnerHTML={{ __html: brandInfo?.infoText ?? "" }}
          ></span>
          {brandInfo?.videoLink && (
            <div className="video-box">
              <h2>{brandInfo?.videoText}</h2>
              <YouTube
                videoId={brandInfo?.videoLink}
                opts={opts}
                onEnd={(e) => {
                  e.target.stopVideo(0);
                }}
              />
            </div>
          )}
        </InfoContainer>
        <ObjectsBox style={{ borderBottom: "none" }}>
          <div className="tBox">
            <h3 style={{ fontSize: "26px" }}>
              {brandInfo?.name} 전체상품 ({objects?.length}개)
            </h3>
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
                    handleType(selectedType, item.type, objects);
                  }}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
          <TypeFilter>
            {objectsFilter &&
              objectsFilter.map((item, index) => (
                <span
                  key={index}
                  className={item === selectedType ? "action" : ""}
                  onClick={(event) => {
                    event.preventDefault();
                    handleType(item, selected, objects);
                  }}
                >
                  {item}
                </span>
              ))}
          </TypeFilter>
          <div className="bBox" role="list" aria-label="상품 목록">
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
      </Container>
    </Center>
  );
};

export default StoreBrandDetail;
const TypeFilter = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin: 20px 0 15px;

  span {
    border: 1px solid ${({ theme }) => theme.lineColor.main};

    cursor: pointer;
    padding: 10px 5px;

    &.action {
      border-color: red;
      color: red;
    }
  }
`;
const InfoContainer = styled.div`
  span {
    text-align: left;
    font-size: 20px;
    margin-top: 7px;
    display: block;
    font-weight: 300;
  }
  div.img-box {
    position: relative;
    img {
      width: 100%;
      height: 300px;
    }
    span {
      padding: 6px 8px;
      font-size: 26px;
      font-weight: bold;
      background-color: #fff;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
  div.video-box {
    width: 700px;
    margin: 70px auto 40px;
    h2 {
      margin-bottom: 30px;
      text-align: center;
    }
  }
  /* border-bottom: 1px solid ${({ theme }) => theme.lineColor.main}; */
`;
const TitleContainer = styled.h1`
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  margin: 30px 0;
`;
const Container = styled.div``;
