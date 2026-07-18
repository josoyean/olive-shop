import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabase";
import type { CardImageType } from "components/card/card.type";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import { useSearchParams } from "react-router-dom";
import EmptyComponent from "../../components/EmptyComponent";
import { handleFilter } from "../../utils/common";
import CategoryMenu from "../../components/CategoryMenu";
import { PageHero } from "@/components/layout/PageHero";
import { Center } from "@/components/ui/Center";
import { cn } from "@/lib/cn";

const StoreRankingList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const menuType = searchParams.get("menuType");

  const [objects, setObjects] = useState<CardImageType[]>([]);

  const handleData = useCallback(async () => {
    let query = supabase.from("objects").select("*,saleItem(*)");
    if (menuType !== "전체") {
      query = query.eq("objectTypeMain", menuType);
    }

    const { data } = await query;
    const filteredData = handleFilter("popular", data ?? []);
    setObjects(filteredData ?? []);
  }, [menuType]);

  useEffect(() => {
    handleData();
  }, [handleData]);
  return (
    <section role="region" aria-label="랭킹">
      <PageHero
        title="랭킹"
        subtitle="오늘의 랭킹! 요즘 가장 핫한 상품"
        className="h-[100px] bg-[url('/public/assets/images/icons/bg_best1_top.png')] bg-[position:50%_0] bg-no-repeat [&_em]:text-inherit [&_span]:text-inherit"
      />
      <Center>
        <div>
          <CategoryMenu />

          <div
            className={cn(
              "grid grid-cols-4 justify-around gap-y-[30px] pb-[50px] [grid-template-columns:repeat(4,215px)]",
              "[&_.best-icon]:hidden [&_.tags]:text-center [&_h5]:text-center"
            )}
            style={objects?.length === 0 ? { display: "unset" } : {}}
          >
            {objects && objects?.length > 0 ? (
              objects?.map((item, index) => (
                <div key={`fallback=${index}`} className="object_box relative">
                  <span className="absolute top-[10px] left-[-20px] z-[1] inline-block h-12 w-12 rounded-full border-2 border-[#f05a5e] bg-white text-center text-sm font-bold leading-[44px] text-[#f05a5e]">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <ObjectCardColumn size="215px" data={item} position="right" />
                </div>
              ))
            ) : (
              <EmptyComponent
                mainText="선택 결과가 없어요"
                subText="랭킹 타입을 다시 선택해주세요"
              />
            )}
          </div>
        </div>
      </Center>
    </section>
  );
};

export default StoreRankingList;
