import React, { useRef, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Center } from "../public/assets/style";
import styled from "styled-components";
import Search from "./compontents/Search";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./redex/store";
import { deleteUser } from "./redex/reducers/userReducer";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import TopButton from "./pages/TopButton";
import FooterContainer from "./pages/footer";
import { useCookies } from "react-cookie";
import { Tooltip } from "react-tooltip";

// import { deleteUserInfo } from "./redex/reducers/userInfo";
import "react-tooltip/dist/react-tooltip.css";
import RecentProducts from "./pages/recentProducts";
import ChatButton from "./pages/ChatButton.js";

interface NavTyle {
  name: string;
  path: string;
  img?: string;
}
const nav: NavTyle[] = [
  {
    name: "회원가입",
    path: "/signup",
  },
  {
    name: "로그인",
    path: "/login",
  },
  {
    name: "장바구니",
    path: "/login",
  },
  {
    name: "최근 본 상품",
    path: "",
  },
];

const memberNav: NavTyle[] = [
  {
    name: "로그아웃",
    path: "/",
  },
  {
    name: "마이페이지",
    path: "/store/mypage?t_page=마이페이지",
  },
  {
    name: "주문배송",
    path: "/store/mypage?t_page=주문배송",
  },
  {
    name: "장바구니",
    path: "/store/mypage/user-cart?t_header_type=1",
  },
  {
    name: "최근 본 상품",
    path: "",
  },
];
const GubNav: NavTyle[] = [
  {
    path: "/store/hot-deal",
    name: "오늘의 특가",
    img: "../assets/images/icons/bargains.png",
  },
  {
    path: "/store/ranking?menuType=전체",
    name: "랭킹",
    img: "../assets/images/icons/ranking.png",
  },
  {
    path: "/store/plan-shop?menuType=전체",
    name: "기획전",
    img: "../assets/images/icons/cosmetics.png",
  },
  {
    path: "/store/goods-sale?menuType=전체&tabsType=핫인기세일",
    name: "세일",
    img: "../assets/images/icons/sale.png",
  },
  {
    path: "/store/events?tabsType=모든회원",
    name: "이벤트",
    img: "../assets/images/icons/event.png",
  },
];
interface GubSubMenu {
  title: { name: string; path: string };
  sub: { name: string; path: string }[];
}
interface GubMenuType {
  title: { name: string; path: string };
  main: GubSubMenu[];
  grid: string;
}
export const GubMenu: GubMenuType[] = [
  {
    title: { name: "뷰티", path: "B" },
    main: [
      {
        title: { name: "스킨케어", path: "001" },
        sub: [
          { name: "스킨/토너", path: "001" },
          { name: "에센스/세람/앰플", path: "002" },
          { name: "크림", path: "003" },
          { name: "미스트/오일", path: "004" },
          { name: "스킨케어세트", path: "005" },
        ],
      },
      {
        title: { name: "마스크팩", path: "002" },
        sub: [
          { name: "시트팩", path: "001" },
          { name: "패드", path: "002" },
          { name: "페이셜팩", path: "003" },
          { name: "코팩", path: "004" },
          { name: "패치", path: "005" },
        ],
      },
      {
        title: { name: "더모 코스메틱", path: "003" },
        sub: [
          { name: "스킨케어", path: "001" },
          { name: "바디케어", path: "002" },
          { name: "클렌징", path: "003" },
          { name: "선케어", path: "004" },
          { name: "마스크팩", path: "005" },
        ],
      },
      {
        title: { name: "향수/디퓨저", path: "004" },
        sub: [
          { name: "여성향수", path: "001" },
          { name: "남성향수", path: "002" },
          { name: "유니섹스향수", path: "003" },
          { name: "미니/고체향수", path: "004" },
          { name: "홈프래그런스", path: "005" },
        ],
      },
      {
        title: { name: "클렌징", path: "005" },
        sub: [
          { name: "클렌징폼/젤", path: "001" },
          { name: "오일/밤", path: "002" },
          { name: "워터/밀크", path: "003" },
          { name: "필링&스크럽", path: "004" },
          { name: "티슈/패드", path: "005" },
          { name: "립&아이리무버", path: "006" },
        ],
      },
      {
        title: { name: "맨즈케어", path: "006" },
        sub: [
          { name: "스킨케어", path: "001" },
          { name: "메이크업", path: "002" },
          { name: "쉐이빙", path: "003" },
          { name: "헤어케어", path: "004" },
          { name: "바디케어", path: "005" },
          { name: "프래그런스/라이프", path: "006" },
        ],
      },
      {
        title: { name: "헤어케어", path: "007" },
        sub: [
          { name: "샴푸/린스", path: "001" },
          { name: "트리트먼트/팩", path: "002" },
          { name: "헤어에센스", path: "003" },
          { name: "염색약/펌", path: "004" },
          { name: "헤어기기/브러시", path: "005" },
          { name: "스타일링", path: "006" },
        ],
      },
      {
        title: { name: "선케어", path: "008" },
        sub: [
          { name: "선크림", path: "001" },
          { name: "선스틱", path: "002" },
          { name: "선쿠션", path: "003" },
          { name: "선스프레이/선패치", path: "004" },
          { name: "태닝/애프터선", path: "005" },
        ],
      },
      {
        title: { name: "메이크업", path: "009" },
        sub: [
          { name: "립메이크업", path: "001" },
          { name: "베이스메이크업", path: "002" },
          { name: "아이메이크업", path: "003" },
        ],
      },
      {
        title: { name: "뷰티소품", path: "010" },
        sub: [
          { name: "메이크업소품", path: "001" },
          { name: "스킨케어소품", path: "002" },
          { name: "아이소품", path: "003" },
          { name: "헤어/바디소품", path: "004" },
          { name: "괄사/네일소품", path: "005" },
          { name: "뷰티디바이스", path: "006" },
          { name: "뷰티잡화", path: "007" },
        ],
      },
      {
        title: { name: "바디케어", path: "011" },
        sub: [
          { name: "로션/오일", path: "001" },
          { name: "샤워/입욕", path: "002" },
          { name: "립케어", path: "003" },
          { name: "핸드케어", path: "004" },
          { name: "바디미스트", path: "005" },
          { name: "제모/왁싱", path: "006" },
          { name: "데오드란트", path: "007" },
          { name: "선물세트", path: "008" },
          { name: "베이비", path: "009" },
        ],
      },
      {
        title: { name: "네일", path: "012" },
        sub: [
          { name: "일반네일", path: "001" },
          { name: "젤네일", path: "002" },
          { name: "네일팁/스티커", path: "003" },
          { name: "네일케어", path: "004" },
        ],
      },
    ],
    grid: "1/5",
  },
  {
    title: { name: "헬스", path: "H" },
    main: [
      {
        title: { name: "건강식품", path: "001" },
        sub: [
          { name: "비타민", path: "001" },
          { name: "유산균", path: "002" },
          { name: "영양제", path: "003" },
          { name: "슬리밍/이너뷰티", path: "004" },
          { name: "키즈", path: "005" },
        ],
      },
      {
        title: { name: "구강용품", path: "002" },
        sub: [
          { name: "칫솔", path: "001" },
          { name: "치약", path: "002" },
          { name: "애프터구강케어", path: "003" },
          { name: "휴대용세트", path: "004" },
          { name: "구강가전", path: "005" },
        ],
      },
      {
        title: { name: "헬스/건강용품", path: "003" },
        sub: [
          { name: "패치/겔", path: "001" },
          { name: "눈관리용품", path: "002" },
          { name: "생활/의료", path: "003" },
          { name: "마사지/헬스용품", path: "004" },
          { name: "풋케어", path: "005" },
        ],
      },
      {
        title: { name: "여성/위생용품", path: "004" },
        sub: [
          { name: "생리/위생용품", path: "001" },
          { name: "Y존케어", path: "002" },
          { name: "성인용품", path: "003" },
          { name: "마사지젤/오일", path: "004" },
          { name: "테스트기", path: "005" },
          { name: "성인용 기저귀", path: "006" },
        ],
      },
    ],
    grid: "5/6",
  },
  {
    title: { name: "푸드", path: "F" },
    main: [
      {
        title: { name: "푸드", path: "001" },
        sub: [
          { name: "식단관리/이너뷰티", path: "001" },
          { name: "과자/초콜릿/디저트", path: "002" },
          { name: "생수/음료/커피", path: "003" },
          { name: "간편식/요리", path: "004" },
          { name: "베이비푸드", path: "005" },
        ],
      },
    ],
    grid: "6/7",
  },
  {
    title: { name: "라이프", path: "L" },
    main: [
      {
        title: { name: "패션", path: "001" },
        sub: [
          { name: "언더웨어", path: "001" },
          { name: "홈웨어", path: "002" },
          { name: "액티브웨어", path: "003" },
          { name: "패션잡화", path: "004" },
        ],
      },
      {
        title: { name: "리빙/가전", path: "002" },
        sub: [
          { name: "방향/탈취", path: "001" },
          { name: "세제/청소", path: "002" },
          { name: "홈데코/배스", path: "003" },
          { name: "가전", path: "004" },
          { name: "베이비", path: "005" },
          { name: "제지류", path: "006" },
          { name: "반려동물", path: "007" },
        ],
      },
      {
        title: { name: "취미/팬시", path: "003" },
        sub: [
          { name: "디지털/기기", path: "001" },
          { name: "문구/팬시", path: "002" },
          { name: "음반", path: "003" },
        ],
      },
    ],
    grid: "7/8",
  },
];
const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state?.user);
  const cartItems = useSelector((state: RootState) => state?.cartDate);
  const [cookies] = useCookies(["token"]);
  const [menuBar, setMenuBar] = useState<boolean>(false);
  const [openedBox, setOpenedBox] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const gubRef = useRef<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  useEffect(() => {
    function handleClickOutside(event: React.MouseEvent<HTMLDivElement>) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target) &&
        gubRef.current &&
        !gubRef.current.contains(event.target)
      ) {
        // 여기서 원하는 작업을 수행
        setMenuBar(false);
      }
    }
    // 마운트 시 document에 이벤트 리스너 추가
    document.addEventListener("mousedown", handleClickOutside);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentRef]);

  useEffect(() => {
    if (!menuBar) return;
    const timer = setTimeout(() => {
      setMenuBar(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [menuBar]);

  useEffect(() => {
    const stateUser = async () => {
      try {
        await onAuthStateChanged(auth, (user) => {
          //console.log("accessToken", user?.accessToken);
          if (user) {
            // setUser(true);
          } else {
            // handleSignedOut()
          }
        });
      } catch (error) {
        console.error("로그인 상태 오류", error);
      }
    };
    stateUser();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!cookies.token && userData.token) {
      alert("로그인 세션이 만료 되었습니다. 다시 로그인해주새요");
      dispatch(deleteUser());
      // dispatch(deleteUserInfo());
      if (location.pathname.includes("/store/mypage")) {
        navigate("/login");
      }
      return;
    }
  }, [location.pathname]);

  const handleSignedOut = async () => {
    await signOut(auth)
      .then(() => {
        navigate("/");
        dispatch(deleteUser());
        // dispatch(deleteUserInfo());
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleTooltipClose = () => {
    setOpenedBox(false);
  };
  const handleTooltipOpen = () => {
    setOpenedBox(true);
  };
  return (
    <div>
      <TopButton />
      <ChatButton />
      <header style={{ paddingTop: "15px" }}>
        <Center style={{ position: "relative" }}>
          <HeaderWrapper>
            <div className="subNav">
              {userData.token !== ""
                ? memberNav.map((item, index) =>
                    item?.name !== "최근 본 상품" ? (
                      <span
                        key={index}
                        onClick={(event) => {
                          event.preventDefault();

                          if (item.path === "") {
                            alert("준비중 입니다");
                            return;
                          }

                          if (item.name === "로그아웃") {
                            if (window.confirm("정말 로그아웃 하시겠습니까?")) {
                              handleSignedOut();
                            }
                          }
                          navigate(item.path);
                        }}
                      >
                        {item.name}
                        {item.name == "장바구니" && (
                          <em style={{ color: "#116dff", marginLeft: "5px" }}>
                            {"(" + cartItems?.length + ")"}
                          </em>
                        )}
                      </span>
                    ) : (
                      <Tooltip
                        key={index}
                        place="bottom-end"
                        closeEvents={handleTooltipClose}
                        open={openedBox}
                        disableInteractive={false}
                        disableFocusListener
                        onClick={(event: React.MouseEvent) =>
                          event.stopPropagation()
                        }
                        disableHoverListener
                        disableTouchListener
                        title={
                          // <ClickAwayListener onClickAway={handleTooltipClose}>
                          <RecentProducts
                            onClickAway={handleTooltipClose}
                            onClose={handleTooltipClose}
                          ></RecentProducts>
                          // </ClickAwayListener>
                        }
                        slotProps={{
                          popper: {
                            disablePortal: true,
                            sx: {
                              width: "1020px", // 원하는 넓이
                              maxWidth: "none", // 디폴트 max-width 무시
                            },
                          },
                          tooltip: {
                            sx: {
                              width: "1020px",
                              minWidth: "1020px",
                              maxWidth: "1020px",
                              borderRadius: "0px",
                              padding: "12px",
                              border: ` 1px solid #ddd`,
                              bgcolor: "white",
                              color: "black",
                            },
                          },
                        }}
                      >
                        <span className="none" onClick={handleTooltipOpen}>
                          {item?.name}
                        </span>
                      </Tooltip>
                    )
                  )
                : nav.map((item, index) => (
                    <span
                      key={index}
                      onClick={(event) => {
                        event.preventDefault();
                        if (item.name === "장바구니") {
                          alert("로그인후 사용 가능 합니다");
                          return;
                        }
                        if (item.name === "최근 본 상품" || item.path === "") {
                          alert("준비중 입니다");
                          return;
                        }

                        navigate(item.path);
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
            </div>
            <div className="nav">
              <img
                src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/sign/images/logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYTBjYzg1NC1jMWE5LTQ2MTktYTBiNy1iMTdmMGE2ZGE3MWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nby5qcGVnIiwiaWF0IjoxNzYxNTQ5NzkwLCJleHAiOjE3OTMwODU3OTB9.M88LPsG-ohG78jriZTdPelEdyHVsX_oj0lrW_Kd_ndM"
                alt="main-log"
                className="main-log"
                onClick={() => {
                  navigate("/");
                  setSearchValue("");
                }}
              />
              <Search
                setSearchValue={setSearchValue}
                searchValue={searchValue}
              ></Search>
            </div>
          </HeaderWrapper>
        </Center>
        <GubWrapper>
          <Center>
            <div
              ref={gubRef}
              className="gub-btn"
              onClick={(event) => {
                event.preventDefault();
                console.log("menuBar", menuBar);
                setMenuBar(!menuBar);
              }}
            >
              <MenuIcon />
              <span>카테고리</span>
            </div>
            <ul className="gub-menu">
              {GubNav.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    if (item.path === "") {
                      alert("준비중 입니다");
                      return;
                    }
                    navigate(item.path);
                  }}
                  className={item.path === location.pathname ? " active" : ""}
                >
                  <img src={item.img} alt={item.name} />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
            {menuBar && (
              <div className="open-gub" ref={componentRef}>
                {GubMenu.map((menu, idex) => (
                  <div
                    key={idex}
                    className="main-menu"
                    style={{ gridColumn: `${menu.grid}` }}
                  >
                    <h2 className="main-title">{menu.title.name}</h2>
                    <div
                      className="sub-menu"
                      style={{
                        gridTemplateColumns: `repeat(${
                          idex === 0 ? 4 : 1
                        },1fr)`,
                      }}
                    >
                      {menu.main.map((items, index) => (
                        <div key={index}>
                          <h3
                            className="sub-title"
                            onClick={(event) => {
                              event.preventDefault();
                              setMenuBar(false);

                              navigate(
                                `/store/goods?menu=${menu.title.name}&item=${items.title.name}`
                              );
                            }}
                          >
                            {items.title.name} &gt;
                          </h3>
                          <ul>
                            {items.sub.map((item, index) => (
                              <li
                                key={index}
                                className="title"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setMenuBar(false);

                                  navigate(
                                    `/store/goods?menu=${menu.title.name}&item=${items.title.name}&title=${item.name}`
                                  );
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
        </GubWrapper>
      </header>

      <div>{<Outlet></Outlet>}</div>

      {/* <ChatbotContainer /> */}

      <FooterContainer />
    </div>
  );
};

export default AppLayout;

const HeaderWrapper = styled.div`
  .subNav {
    display: flex;
    column-gap: 15px;
    justify-content: flex-end;
    img {
      cursor: pointer;
    }
    > span {
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
      }
      &:last-child::after {
        display: none;
      }
      &.none::after {
        content: none;
      }
    }
  }

  .nav {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
`;
const GubWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.lineColor.main};
  border-bottom: 2px solid #555;
  height: 47px;
  margin-top: 30px;
  > div {
    z-index: 900;
    display: flex;
    align-items: center;
    height: 100%;
    border-right: 1px solid ${({ theme }) => theme.lineColor.main};
    border-left: 1px solid ${({ theme }) => theme.lineColor.main};
    position: relative;
  }
  .gub-btn {
    width: 170px;
    font-size: ${({ theme }) => theme.fontSize.large};
    color: ${({ theme }) => theme.fontColor.black};
    font-size: 16px;
    cursor: pointer;
    display: flex;
    column-gap: 10px;
    justify-content: center;
    align-items: center;
  }
  span {
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: bolder;
    color: ${({ theme }) => theme.fontColor.black};
  }
  .gub-menu {
    cursor: pointer;
    display: flex;
    column-gap: 15px;
    width: calc(100% - 170px);
    height: 47px;
    li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 15px;
      span {
        position: relative;
        &.none::after {
          content: none;
        }
      }
      span::after {
        display: block;
        content: "";
        position: absolute;
        bottom: -1px;
        left: 50%;

        transform: translateX(-50%);
        width: 0%;
        height: 2px;
        background-color: ${({ theme }) => theme.color.main};
        transition-property: width;
        transition-duration: 150ms;
      }
      &:first-child {
        border-left: 1px solid ${({ theme }) => theme.lineColor.main};
      }

      &:hover {
        span {
          position: relative;
          color: ${({ theme }) => theme.color.main};
          &::after {
            width: 100%;
          }
          &.none::after {
            content: none;
          }
        }
      }
    }
    img {
      width: 20px;
      height: 20px;
    }
  }

  .open-gub {
    position: absolute;
    top: 46px;
    left: 0;
    right: 0;
    width: 100%;
    padding: 18px;
    background-color: #fff;

    z-index: 999;
    border: 1px solid ${({ theme }) => theme.lineColor.main};
    grid-template-columns: repeat(7, 1fr);
    display: grid;
    h2 {
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    h3,
    li {
      cursor: pointer;
    }
    ul {
      display: flex;
      flex-direction: column;
      row-gap: 5px;
      margin-top: 5px;
    }
    .main-title {
      font-size: 24px;
      width: 95%;
      border-bottom: 1px solid ${({ theme }) => theme.lineColor.main};
    }

    .sub-menu {
      display: grid;
      row-gap: 15px;
      li {
        font-size: ${({ theme }) => theme.fontSize.middle};
      }
    }
  }
`;
