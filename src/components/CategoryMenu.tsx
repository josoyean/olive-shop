import React from "react";
import { useSearchParams } from "react-router-dom";
import { GUB_MENU } from "@/constants/navigation";
import { cn } from "@/lib/cn";

const CategoryMenu = ({
  style,
}: {
  style?: React.CSSProperties | undefined;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuType = searchParams.get("menuType");
  const tabsType = searchParams.get("tabsType");

  return (
    <div
      className="relative z-[9] my-[35px]"
      style={style}
    >
      <ul className="grid grid-cols-6">
        <li
          className={cn(
            "relative -mt-px -ml-px h-10 cursor-pointer border border-[#ddd] px-3 text-sm leading-10 font-bold text-[#888]",
            menuType === "전체" && "action bg-[#f65c60] !text-white"
          )}
          onClick={(event) => {
            event.preventDefault();
            setSearchParams(
              !tabsType
                ? { menuType: "전체" }
                : { menuType: "전체", tabsType }
            );
          }}
        >
          전체
        </li>
        {GUB_MENU.map((menus) =>
          menus.main.map((menu, index) => (
            <li
              key={index}
              className={cn(
                "relative -mt-px -ml-px h-10 cursor-pointer border border-[#ddd] px-3 text-sm leading-10 font-bold text-[#888]",
                menu.title.name === menuType && "action bg-[#f65c60] !text-white"
              )}
              onClick={(event) => {
                event.preventDefault();
                setSearchParams(
                  !tabsType
                    ? { menuType: menu.title.name }
                    : { menuType: menu.title.name, tabsType }
                );
              }}
            >
              {menu.title.name}
            </li>
          ))
        )}
        <li className="relative -mt-px -ml-px h-10 cursor-auto border border-[#ddd] px-3" />
        <li className="relative -mt-px -ml-px h-10 cursor-auto border border-[#ddd] px-3" />
        <li className="relative -mt-px -ml-px h-10 cursor-auto border border-[#ddd] px-3" />
      </ul>
    </div>
  );
};

export default CategoryMenu;
