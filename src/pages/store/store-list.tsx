import { useEffect, useState } from "react";
import { Center } from "../../../public/assets/style";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { GubMenu } from "../../app-layout";
import { supabase } from "../../supabase";
import {
  CardImageType,
  filteredSearch,
} from "../../compontents/card/card.type";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";
import { handleFilter } from "../../bin/common";
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
      // 대분류까지
      query = query.eq("objectTypeMain", searchItem);
    } else {
      // 소분류까지 - 전부다
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
    const searchMenuFilter = GubMenu.filter(
      (menu) => menu.title.name === searchMenu
    )[0].main;
    const searchItemFilter = searchMenuFilter?.filter(
      (item) => item.title.name === searchItem
    )[0].sub;
    setMenu(searchItemFilter);
  }, [searchTitle, searchItem]);

  return (
    <Center>
      <Wrapper>
        <ContainerLeft>
          <h2>{!searchTitle ? searchItem : searchTitle}</h2>
          {!searchTitle && (
            <ul>
              {menu.map((item) => (
                <li
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
        </ContainerLeft>
        <ContainerRight>
          <h3>
            {!searchTitle ? searchItem : searchTitle} 카테고리에서{" "}
            <em style={{ color: "#116dff" }}>{objects?.length}개</em>의 상품이
            등록되어 있습니다.
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
          <Object>
            {objectsList &&
              objectsList?.map((list, index) => (
                <ObjectCardColumn
                  key={index}
                  size="192px"
                  option={false}
                  data={list && list}
                />
              ))}
          </Object>
        </ContainerRight>
      </Wrapper>
    </Center>
  );
};

const Object = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 15px;
  margin-top: 40px;
`;
const Wrapper = styled.div`
  min-height: calc(100vh - 166.5px);
  border-right: 1px solid ${({ theme }) => theme.lineColor.main};
  border-left: 1px solid ${({ theme }) => theme.lineColor.main};
  display: flex;
`;
const ContainerLeft = styled.div`
  width: 170px;
  height: inherit;
  border-right: 1px solid ${({ theme }) => theme.lineColor.main};
  h2 {
    text-align: center;
    margin-top: 17px;
  }

  ul {
    margin-top: 17px;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    li {
      cursor: pointer;
      text-align: center;
      color: ${({ theme }) => theme.fontColor.sub};
      font-size: ${({ theme }) => theme.fontSize.middle};

      &:hover {
        color: ${({ theme }) => theme.color.main};
      }
    }
  }
`;
const ContainerRight = styled.div`
  min-width: calc(100% - 170px);
  padding: 15px;
  h3 {
    text-align: center;
    margin-top: 7px;
  }

  .filter {
    display: flex;
    column-gap: 15px;
    margin: 25px 0 15px;
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
`;
export default StoreList;
