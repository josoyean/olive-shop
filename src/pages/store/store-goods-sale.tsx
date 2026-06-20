import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryMenu from "../../components/CategoryMenu";
import { supabase } from "../../supabase";
import { handleFilter } from "../../utils/common";
import {
  filteredSearch,
  type CardImageType,
} from "../../components/card/card.type";
import EmptyComponent from "../../components/EmptyComponent";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import { PageHero } from "@/components/layout/PageHero";
import { Center } from "@/components/ui/Center";
import { Tabs, TabItem } from "@/components/ui/FormElements";

const StoreGoodsSale = () => {
  const today = new Date().toISOString().split("T")[0];
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
    if (tabsType === "핫인기세일") {
      query = query
        .filter("saleItem.start_sale_date", "lte", today)
        .filter("saleItem.end_sale_date", "gte", today);
    }

    const { data } = await query;

    const filteredData = handleFilter(
      "popular",
      data?.filter((item) => item.saleItem) ?? []
    );

    setObjectsList(filteredData ?? []);
  }, [tabsType, menuType, selected]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <section role="region" aria-label="세일">
      <PageHero
        title="세일"
        subtitle="핫 세일! 이건 꼭 사야 해!"
        className="h-[100px] bg-[url('/public/assets/images/icons/bg_sale_top.png')] bg-[position:50%_0] bg-no-repeat [&_em]:text-black [&_span]:text-black"
      />
      <Center>
        <div>
          <Tabs grid={2} role="tablist" aria-label="세일 필터">
            <TabItem
              active={tabsType === "핫인기세일"}
              onClick={() => {
                setSelected("popular");
                setSearchParams({
                  menuType: "전체",
                  tabsType: "핫인기세일",
                });
              }}
            >
              핫인기 세일
            </TabItem>
            <TabItem
              active={tabsType === "증정하나더"}
              onClick={() => {
                setSelected("popular");
                setSearchParams({
                  menuType: "전체",
                  tabsType: "증정하나더",
                });
              }}
            >
              증정/하나 더
            </TabItem>
          </Tabs>
          <CategoryMenu />
          {objectsList && objectsList?.length > 0 ? (
            <div>
              <h2 className="mb-[25px] border-b-2 border-[#333] pb-2.5 text-center font-[350] [&_span]:text-primary">
                전체 <span>{objectsList?.length}</span>개의 상품이 등록되어
                있습니다
              </h2>
              <div className="flex items-center justify-end gap-[15px] border-b border-[#ddd] pb-[25px] [&_img]:cursor-pointer [&_span]:relative [&_span]:block [&_span]:cursor-pointer [&_span]:text-xs [&_span]:text-text-sub [&_span]:after:absolute [&_span]:after:right-[-8px] [&_span]:after:top-0 [&_span]:after:font-normal [&_span]:after:content-['_|_'] [&_span:last-child]:after:hidden">
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
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="my-10 mb-[50px] grid grid-cols-4 justify-between gap-y-10 [grid-template-columns:repeat(4,230px)] [&_.tags]:text-center [&_h5]:text-center">
                {objectsList?.map((object) => (
                  <ObjectCardColumn
                    size="230px"
                    data={object}
                    key={object?.object_seq}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyComponent
              mainText="선택 결과가 없어요"
              subText="세일 목록을 다시 선택해주세요"
            />
          )}
        </div>
      </Center>
    </section>
  );
};

export default StoreGoodsSale;
