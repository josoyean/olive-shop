import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  filteredSearch,
  type BrandType,
  type CardImageType,
} from "../../components/card/card.type";
import YouTube, { YouTubeProps } from "react-youtube";
import { handleFilter } from "../../utils/common";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import { Center } from "@/components/ui/Center";
import { ObjectsBox } from "@/components/ui/FormElements";
import { cn } from "@/lib/cn";

const StoreBrandDetail = () => {
  const today = new Date().toISOString().split("T")[0];
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
      <div role="region" aria-label="브랜드 상세">
        <h1 className="my-[30px] text-center text-[40px] font-bold">
          {brandInfo?.name}
        </h1>
        <div className="[&_span]:mt-[7px] [&_span]:block [&_span]:text-left [&_span]:text-xl [&_span]:font-light">
          <div className="img-box relative [&_img]:h-[300px] [&_img]:w-full [&_span]:absolute [&_span]:bottom-0 [&_span]:left-0 [&_span]:bg-white [&_span]:px-2 [&_span]:py-1.5 [&_span]:text-[26px] [&_span]:font-bold">
            <img src={brandInfo?.brandImg} alt="브랜드 소개 이미지" />
            <span>{brandInfo?.infoMainText}</span>
          </div>
          <span
            dangerouslySetInnerHTML={{ __html: brandInfo?.infoText ?? "" }}
          ></span>
          {brandInfo?.videoLink && (
            <div className="video-box mx-auto my-[70px] mb-10 w-[700px] [&_h2]:mb-[30px] [&_h2]:text-center">
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
        </div>
        <ObjectsBox className="border-b-0">
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
          <div className="my-5 mb-[15px] grid grid-cols-5 [&_span]:cursor-pointer [&_span]:border [&_span]:border-line-main [&_span]:p-[10px_5px] [&_span.action]:border-red-500 [&_span.action]:text-red-500">
            {objectsFilter &&
              objectsFilter.map((item, index) => (
                <span
                  key={index}
                  className={cn(item === selectedType && "action")}
                  onClick={(event) => {
                    event.preventDefault();
                    handleType(item, selected, objects);
                  }}
                >
                  {item}
                </span>
              ))}
          </div>
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
      </div>
    </Center>
  );
};

export default StoreBrandDetail;
