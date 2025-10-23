import React from "react";
import { GubMenu } from "../app-layout";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
const CategoryMenu = ({
  style,
}: {
  style?: React.CSSProperties | undefined;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuType = searchParams.get("menuType");
  const tabsType = searchParams.get("tabsType");
  return (
    <CommonMenu style={{ ...style }}>
      <ul>
        <li
          className={menuType === "전체" ? " action" : ""}
          onClick={(event) => {
            event.preventDefault();
            setSearchParams(
              !tabsType
                ? { menuType: "전체" }
                : { menuType: "전체", tabsType: tabsType }
            );
          }}
        >
          전체
        </li>
        {GubMenu.map((menus) =>
          menus.main.map((menu, index) => (
            <li
              key={index}
              className={menu.title.name === menuType ? " action" : ""}
              onClick={(event) => {
                event.preventDefault();
                setSearchParams(
                  !tabsType
                    ? { menuType: menu.title.name }
                    : { menuType: menu.title.name, tabsType: tabsType }
                );
              }}
            >
              {menu.title.name}
            </li>
          ))
        )}
        <li className="none"></li>
        <li className="none"></li>
        <li className="none"></li>
      </ul>
    </CommonMenu>
  );
};
const CommonMenu = styled.div`
  margin: 35px 0;
  z-index: 9;
  position: relative;
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
export default CategoryMenu;
