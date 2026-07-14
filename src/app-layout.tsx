import React, { useRef, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Center } from "@/components/ui/Center";
import Search from "@/components/Search";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { deleteUser } from "@/redux/reducers/userReducer";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import TopButton from "@/components/layout/TopButton";
import FooterContainer from "@/components/layout/Footer";
import RecentProducts from "@/components/layout/RecentProducts";
import ChatButton from "@/components/layout/ChatButton";
import { useCookies } from "react-cookie";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { GUB_MENU } from "@/constants/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  name: string;
  path: string;
  img?: string;
}

const guestNav: NavItem[] = [
  { name: "회원가입", path: "/signup" },
  { name: "로그인", path: "/login" },
  { name: "장바구니", path: "/login" },
  { name: "최근 본 상품", path: "" },
];

const memberNav: NavItem[] = [
  { name: "로그아웃", path: "/" },
  { name: "마이페이지", path: "/store/mypage?t_page=마이페이지" },
  { name: "주문배송", path: "/store/mypage?t_page=주문배송" },
  { name: "장바구니", path: "/store/mypage/user-cart?t_header_type=1" },
  { name: "최근 본 상품", path: "//" },
];

const gnbNav: NavItem[] = [
  { path: "/store/hot-deal", name: "오늘의 특가", img: "../assets/images/icons/bargains.png" },
  { path: "/store/ranking?menuType=전체", name: "랭킹", img: "../assets/images/icons/ranking.png" },
  { path: "/store/plan-shop?menuType=전체", name: "기획전", img: "../assets/images/icons/cosmetics.png" },
  { path: "/store/goods-sale?menuType=전체&tabsType=핫인기세일", name: "세일", img: "../assets/images/icons/sale.png" },
  { path: "/store/events?tabsType=모든회원", name: "이벤트", img: "../assets/images/icons/event.png" },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const cartItems = useSelector((state: RootState) => state.cartDate);
  const [cookies] = useCookies(["token"]);
  const [menuBar, setMenuBar] = useState(false);
  const [openedBox, setOpenedBox] = useState(false);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const gubRef = useRef<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node) &&
        gubRef.current &&
        !gubRef.current.contains(event.target as Node)
      ) {
        setMenuBar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!menuBar) return;
    const timer = setTimeout(() => setMenuBar(false), 10000);
    return () => clearTimeout(timer);
  }, [menuBar]);

  useEffect(() => {
    onAuthStateChanged(auth, () => {});
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!cookies.token && userData.token) {
      alert("로그인 세션이 만료 되었습니다. 다시 로그인해주새요");
      dispatch(deleteUser());
      if (location.pathname.includes("/store/mypage")) {
        navigate("/login");
      }
    }
  }, [location.pathname, cookies.token, userData.token, dispatch, navigate]);

  const handleSignedOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
      dispatch(deleteUser());
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavClick = (item: NavItem, isMember: boolean) => {
    if (item.path === "") {
      alert("준비중 입니다");
      return;
    }
    if (item.name === "로그아웃") {
      if (window.confirm("정말 로그아웃 하시겠습니까?")) {
        handleSignedOut();
      }
      return;
    }
    if (item.name === "장바구니" && !isMember) {
      alert("로그인후 사용 가능 합니다");
      return;
    }
    if (item.name === "최근 본 상품") {
      setOpenedBox(true);
      return;
    }
    navigate(item.path);
  };

  const navItems = userData.token !== "" ? memberNav : guestNav;
  const tooltipIndex = userData.token !== "" ? 4 : 3;

  return (
    <div>
      <TopButton />
      <ChatButton />
      <header role="banner" className="pt-[15px]">
        <Center className="relative">
          <div
            className={cn(
              "[&_.subNav]:flex [&_.subNav]:justify-end [&_.subNav]:gap-[15px]",
              "[&_.subNav_img]:cursor-pointer [&_.subNav_img:focus]:outline [&_.subNav_img:focus]:outline-2 [&_.subNav_img:focus]:outline-primary [&_.subNav_img:focus]:outline-offset-2",
              "[&_.subNav>span]:relative [&_.subNav>span]:block [&_.subNav>span]:cursor-pointer [&_.subNav>span]:text-xs [&_.subNav>span]:text-text-sub",
              "[&_.subNav>span:focus]:outline [&_.subNav>span:focus]:outline-2 [&_.subNav>span:focus]:outline-primary [&_.subNav>span:focus]:outline-offset-2",
              "[&_.subNavBtn]:after:absolute [&_.subNavBtn]:after:right-[-8px] [&_.subNavBtn]:after:top-0 [&_.subNavBtn]:after:content-['_|_']",
              "[&_.nav]:mt-5 [&_.nav]:flex [&_.nav]:items-end [&_.nav]:justify-between",
              "[&_#my-tooltip-click]:left-0 [&_#my-tooltip-click]:top-5 [&_#my-tooltip-click]:opacity-100"
            )}
          >
            <nav className="subNav" role="navigation" aria-label="사용자 메뉴">
              {navItems.map((item, index) => (
                <span
                  key={item.name}
                  className={index === tooltipIndex ? "" : "subNavBtn"}
                  data-tooltip-id={index === tooltipIndex ? "my-tooltip-click" : ""}
                  tabIndex={0}
                  role="button"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick(item, userData.token !== "");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleNavClick(item, userData.token !== "");
                    }
                  }}
                >
                  {item.name}
                  {item.name === "장바구니" && userData.token !== "" && (
                    <em className="ml-[5px] text-primary">
                      ({cartItems?.length})
                    </em>
                  )}
                </span>
              ))}
              <Tooltip
                id="my-tooltip-click"
                place="bottom"
                style={{ backgroundColor: "white", zIndex: 9999, padding: 0 }}
                openOnClick
                clickable
                isOpen={openedBox}
                globalCloseEvents={{
                  escape: true,
                  scroll: true,
                  clickOutsideAnchor: true,
                }}
              >
                {openedBox && (
                  <RecentProducts
                    onClickAway={() => setOpenedBox(false)}
                    onClose={() => setOpenedBox(false)}
                  />
                )}
              </Tooltip>
            </nav>
            <div className="nav">
              <img
                src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/sign/images/logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYTBjYzg1NC1jMWE5LTQ2MTktYTBiNy1iMTdmMGE2ZGE3MWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nby5qcGVnIiwiaWF0IjoxNzYxNTQ5NzkwLCJleHAiOjE3OTMwODU3OTB9.M88LPsG-ohG78jriZTdPelEdyHVsX_oj0lrW_Kd_ndM"
                alt="main-log"
                className="main-log cursor-pointer"
                tabIndex={0}
                role="button"
                onClick={() => {
                  navigate("/");
                  setSearchValue("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate("/");
                    setSearchValue("");
                  }
                }}
              />
              <Search setSearchValue={setSearchValue} searchValue={searchValue} />
            </div>
          </div>
        </Center>

        <div className="mt-[30px] h-[47px] border-t border-line-main border-b-2 border-b-[#555]">
          <Center className="relative z-[900] flex h-full items-center border-x border-line-main [&_.gub-btn]:flex [&_.gub-btn]:w-[170px] [&_.gub-btn]:cursor-pointer [&_.gub-btn]:items-center [&_.gub-btn]:justify-center [&_.gub-btn]:gap-2.5 [&_.gub-btn]:text-base [&_.gub-btn]:text-black [&_.gub-btn_span]:text-base [&_.gub-btn_span]:font-bold [&_.gub-btn_span]:text-black [&_.gub-btn:focus]:outline [&_.gub-btn:focus]:outline-2 [&_.gub-btn:focus]:outline-primary [&_.gub-btn:focus]:outline-offset-[-2px] [&_.gub-menu]:flex [&_.gub-menu]:h-[47px] [&_.gub-menu]:w-[calc(100%-170px)] [&_.gub-menu]:cursor-pointer [&_.gub-menu]:gap-[15px] [&_.gub-menu_li]:flex [&_.gub-menu_li]:items-center [&_.gub-menu_li]:gap-2.5 [&_.gub-menu_li]:px-[15px] [&_.gub-menu_li:focus]:outline [&_.gub-menu_li:focus]:outline-2 [&_.gub-menu_li:focus]:outline-primary [&_.gub-menu_li:focus]:outline-offset-[-2px] [&_.gub-menu_li:first-child]:border-l [&_.gub-menu_li:first-child]:border-line-main [&_.gub-menu_li:hover_span]:!text-primary [&_.gub-menu_li:focus_span]:!text-primary [&_.gub-menu_li_span]:relative [&_.gub-menu_li_span]:text-base [&_.gub-menu_li_span]:font-bold [&_.gub-menu_li_span]:text-black [&_.gub-menu_li_span]:after:absolute [&_.gub-menu_li_span]:after:bottom-[-1px] [&_.gub-menu_li_span]:after:left-1/2 [&_.gub-menu_li_span]:after:block [&_.gub-menu_li_span]:after:h-0.5 [&_.gub-menu_li_span]:after:w-0 [&_.gub-menu_li_span]:after:-translate-x-1/2 [&_.gub-menu_li_span]:after:bg-primary [&_.gub-menu_li_span]:after:transition-[width] [&_.gub-menu_li_span]:after:duration-150 [&_.gub-menu_li_span]:after:content-[''] [&_.gub-menu_li:hover_span]:after:w-full [&_.gub-menu_li:focus_span]:after:w-full [&_.gub-menu_img]:h-5 [&_.gub-menu_img]:w-5 [&_.open-gub]:absolute [&_.open-gub]:top-[46px] [&_.open-gub]:left-0 [&_.open-gub]:right-0 [&_.open-gub]:z-[999] [&_.open-gub]:grid [&_.open-gub]:w-full [&_.open-gub]:grid-cols-7 [&_.open-gub]:border [&_.open-gub]:border-line-main [&_.open-gub]:bg-white [&_.open-gub]:p-[18px] [&_.open-gub_h2]:mb-[15px] [&_.open-gub_h2]:pb-[5px] [&_.open-gub_h3]:cursor-pointer [&_.open-gub_h3:focus]:outline [&_.open-gub_h3:focus]:outline-2 [&_.open-gub_h3:focus]:outline-primary [&_.open-gub_h3:focus]:outline-offset-2 [&_.open-gub_li]:cursor-pointer [&_.open-gub_li]:text-sm [&_.open-gub_li]:whitespace-normal [&_.open-gub_li:focus]:outline [&_.open-gub_li:focus]:outline-2 [&_.open-gub_li:focus]:outline-primary [&_.open-gub_li:focus]:outline-offset-2 [&_.open-gub_ul]:mt-[5px] [&_.open-gub_ul]:flex [&_.open-gub_ul]:flex-col [&_.open-gub_ul]:gap-[5px] [&_.main-title]:w-[95%] [&_.main-title]:border-b [&_.main-title]:border-line-main [&_.main-title]:text-2xl [&_.sub-menu]:grid [&_.sub-menu]:gap-[15px]">
            <div
              ref={gubRef}
              className="gub-btn"
              tabIndex={0}
              role="button"
              aria-expanded={menuBar}
              aria-haspopup="true"
              onClick={(event) => {
                event.preventDefault();
                setMenuBar(!menuBar);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setMenuBar(!menuBar);
                }
              }}
            >
              <MenuIcon />
              <span>카테고리</span>
            </div>
            <ul className="gub-menu" role="menubar" aria-label="메인 메뉴">
              {gnbNav.map((item) => (
                <li
                  key={item.path}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    if (item.path === "") {
                      alert("준비중 입니다");
                      return;
                    }
                    navigate(item.path);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(item.path);
                    }
                  }}
                  className={item.path === location.pathname ? "active" : ""}
                >
                  <img src={item.img} alt={item.name} />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
            {menuBar && (
              <div className="open-gub" ref={componentRef} role="menu" aria-label="카테고리 메뉴">
                {GUB_MENU.map((menu, index) => (
                  <div
                    key={menu.title.name}
                    className="main-menu"
                    style={{ gridColumn: menu.grid }}
                  >
                    <h2 className="main-title" aria-label={menu.title.name}>
                      {menu.title.name}
                    </h2>
                    <div
                      className="sub-menu"
                      style={{
                        gridTemplateColumns: `repeat(${index === 0 ? 4 : 1}, 1fr)`,
                      }}
                    >
                      {menu.main.map((items) => (
                        <div key={items.title.name} role="menuitem">
                          <h3
                            className="sub-title"
                            aria-label={items.title.name}
                            tabIndex={0}
                            role="button"
                            onClick={(event) => {
                              event.preventDefault();
                              setMenuBar(false);
                              navigate(
                                `/store/goods?menu=${menu.title.name}&item=${items.title.name}`
                              );
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setMenuBar(false);
                                navigate(
                                  `/store/goods?menu=${menu.title.name}&item=${items.title.name}`
                                );
                              }
                            }}
                          >
                            {items.title.name} &gt;
                          </h3>
                          <ul role="menu">
                            {items.sub.map((item) => (
                              <li
                                key={item.name}
                                className="title"
                                role="menuitem"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.preventDefault();
                                  setMenuBar(false);
                                  navigate(
                                    `/store/goods?menu=${menu.title.name}&item=${items.title.name}&title=${item.name}`
                                  );
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setMenuBar(false);
                                    navigate(
                                      `/store/goods?menu=${menu.title.name}&item=${items.title.name}&title=${item.name}`
                                    );
                                  }
                                }}
                              >
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Center>
        </div>
      </header>

      <main role="main">
        <Outlet />
      </main>

      <FooterContainer />
    </div>
  );
};

export default AppLayout;
