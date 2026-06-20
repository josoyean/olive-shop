import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  CardImageType,
  BrandType,
  filteredSearch,
} from "../../components/card/card.type";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import { handleFilter } from "../../utils/common";
import { Center } from "@/components/ui/Center";
import { ObjectsBox } from "@/components/ui/FormElements";

const SearchMain = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchValue = searchParams.get("getSearchValue");
  const [brandYN, setBrandYN] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | undefined>(
    filteredSearch[0].type
  );
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const [objectsList, setObjectsList] = useState<CardImageType[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandType | null>(null);
  const handleData = async (value: string) => {
    const { data: brandData } = await supabase
      .from("brands")
      .select("*")
      .eq("name", value)
      .single();

    const seq = brandData?.brand_seq;
    if (brandData) {
      setBrandInfo(brandData);
      const { data: nameData } = await supabase
        .from("objects")
        .select("*,saleItem(*)")
        .eq("brand_seq", seq);
      setObjects(nameData ?? []);
      setBrandYN(true);
      const filterData = handleFilter("popular", nameData ?? []);
      setObjectsList(filterData);
    } else {
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
      <div role="region" aria-label="검색 결과" className="[&_h1]:my-10">
        <h1>'{searchValue || " "}'에 대한 검색결과</h1>
        {!searchValue || objects?.length === 0 ? (
          <div className="flex h-[450px] flex-col items-center justify-center [&_img]:h-[100px] [&_img]:w-[100px] [&_p]:mb-3 [&_p]:text-xl [&_p]:font-bold [&_p]:leading-[29px] [&_p]:text-[#131518] [&_span]:text-center [&_span]:text-base [&_span]:leading-[22px] [&_span]:text-[#757d86]">
            <img
              src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/public/images/shopping.png"
              alt="no_data"
            />
            <p>검색 결과가 없어요</p>
            <span>
              철자를 확인하거나 <br />
              다른 키워드로 검색해보세요
            </span>
          </div>
        ) : (
          <>
            {brandYN && (
              <div
                className="flex w-full cursor-pointer items-center gap-5 rounded-[5px] border border-line-main p-[15px_14px] [&_em]:font-bold [&_img]:h-20 [&_img]:w-[204px] [&_img]:overflow-hidden [&_img]:rounded-[3px] [&_img]:object-cover [&_p]:text-sm [&_p]:leading-[17px] [&_p]:text-[#757d86] [&_span]:mt-0.5 [&_span]:flex [&_span]:items-center [&_span]:gap-1.5 [&_span]:pr-3.5 [&_span]:text-lg [&_span]:leading-[26px] [&_span]:text-[#131518]"
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
              </div>
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
              <div className="bBox" role="list" aria-label="검색된 상품">
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
      </div>
    </Center>
  );
};

export default SearchMain;
