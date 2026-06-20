import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GUB_MENU } from "@/constants/navigation";
import { supabase } from "../../supabase";
import {
  CardImageType,
  filteredSearch,
} from "../../components/card/card.type";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import { handleFilter } from "../../utils/common";
import { Center } from "@/components/ui/Center";

interface menuType {
  name: string;
  path?: string;
  type?: string;
}

const StoreList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [menu, setMenu] = useState<menuType[]>([]);
  const [selected, setSelected] = useState<string | undefined>(
    filteredSearch[0].type
  );
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const [objectsList, setObjectsList] = useState<CardImageType[]>([]);
  const searchMenu = searchParams.get("menu") || "";
  const searchItem = searchParams.get("item") || "";
  const searchTitle = searchParams.get("title") || "";

  const handleData = async (title: string | null) => {
    let query = supabase.from("objects").select("*");
    if (!title) {
      query = query.eq("objectTypeMain", searchItem);
    } else {
      query = query
        .eq("objectTypeMain", searchItem)
        .eq("objectTypeSub", searchTitle);
    }
    const { data: objectsData } = await query;
    setObjects(objectsData ?? []);
    const filteredData = handleFilter("popular", objectsData ?? []);
    setObjectsList(filteredData);
  };
  useEffect(() => {
    handleData(searchTitle);
    if (searchTitle !== "") return;
    const searchMenuFilter = GUB_MENU.filter(
      (menu) => menu.title.name === searchMenu
    )[0].main;
    const searchItemFilter = searchMenuFilter?.filter(
      (item) => item.title.name === searchItem
    )[0].sub;
    setMenu(searchItemFilter);
  }, [searchTitle, searchItem]);

  return (
    <Center>
      <div
        className="flex min-h-[calc(100vh-166.5px)] border-x border-line-main"
        role="region"
        aria-label="상품 목록"
      >
        <div
          className="h-inherit w-[170px] border-r border-line-main [&_h2]:mt-[17px] [&_h2]:text-center [&_li]:cursor-pointer [&_li]:text-center [&_li]:text-sm [&_li]:text-text-sub [&_li:hover]:text-primary [&_ul]:mt-[17px] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2"
          role="navigation"
          aria-label="카테고리 메뉴"
        >
          <h2>{!searchTitle ? searchItem : searchTitle}</h2>
          {!searchTitle && (
            <ul role="menu" aria-label="서브 카테고리">
              {menu.map((item) => (
                <li
                  role="menuitem"
                  key={item.path}
                  onClick={(event) => {
                    event.preventDefault();

                    setSearchParams({
                      menu: searchMenu,
                      item: searchItem,
                      title: item.name,
                    });
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-[calc(100%-170px)] p-[15px] [&_h3]:mt-[7px] [&_h3]:text-center">
          <h3>
            {!searchTitle ? searchItem : searchTitle} 카테고리에서{" "}
            <em className="text-primary">{objects?.length}개</em>의 상품이
            등록되어 있습니다.
          </h3>
          <div className="my-[25px] mb-[15px] flex gap-[15px] [&_img]:cursor-pointer [&_span]:relative [&_span]:block [&_span]:cursor-pointer [&_span]:text-xs [&_span]:text-text-sub [&_span]:after:absolute [&_span]:after:right-[-8px] [&_span]:after:top-0 [&_span]:after:font-normal [&_span]:after:content-['_|_'] [&_span:last-child]:after:hidden">
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
                  const filteredData = handleFilter(
                    item?.type ?? "popular",
                    objects ?? []
                  );
                  setObjectsList(filteredData);
                  setSelected(item.type);
                }}
              >
                {item.name}
              </span>
            ))}
          </div>
          <div
            className="mt-10 grid grid-cols-4 gap-x-[15px] gap-y-5"
            role="list"
            aria-label="상품 목록"
          >
            {objectsList &&
              objectsList?.map((list, index) => (
                <ObjectCardColumn
                  key={index}
                  size="192px"
                  option={false}
                  data={list && list}
                />
              ))}
          </div>
        </div>
      </div>
    </Center>
  );
};

export default StoreList;
