import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Center } from "../../../public/assets/style";
import { theme } from "../../../public/assets/styles/theme";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import type { CardImageType } from "compontents/card/card.type";
import type { RootState } from "redex/store";
import { addToCart } from "../../pages/carts/addToCart";
import Slider from "react-slick";
import { handleCartCount, handlePrice } from "../../bin/common";
import { useSelector, useDispatch } from "react-redux";
import { modify } from "../../redex/reducers/userCartCount";
import ObjectCardRow from "../../compontents/card/ObjectCardRow";
import {
  addProducts,
  clearProducts,
} from "../../redex/reducers/recentProductsData";

const StoreGoodsDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [objects, setObjects] = useState<CardImageType>();
  const [objectItems, setObjectItems] = useState<CardImageType[]>([]);
  const [imgIndex, setImageIndex] = useState<number>(0);
  const [buyCount, setBuyCount] = useState<number>(1);
  const [detailOpened, setDetailOpened] = useState<boolean>(false);
  const userData = useSelector((state: RootState) => state?.user.token);
  const productData = useSelector((state: RootState) => state?.recentProducts);
  const searchObject = searchParams.get("getGoods");
  const handleData = async (item: string) => {
    const { data: selectedData, error: cartError } = await supabase
      .from("objects")
      .select("*")
      .eq("object_seq", item);
    const selected = !selectedData ? {} : selectedData[0];
    setObjects(selected);
    dispatch(addProducts(selected));

    const { data: objectData, error } = await supabase
      .from("objects")
      .select("*");
    setObjectItems(!objectData ? [] : objectData);
  };

  useEffect(() => {
    if (!searchObject) return;
    handleData(searchObject);
    setBuyCount(1);
  }, [searchObject]);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,

    swipeToSlide: true,
    // autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
  };
  return (
    <Center>
      <div>
        <BoxContainer>
          <div className="img_box">
            <img
              src={
                imgIndex === 0
                  ? objects?.img
                  : objects?.subImg && objects?.subImg[imgIndex - 1]
              }
              alt="제품 이미지"
            />
            <div className="all_img">
              <img
                src={objects?.img}
                className={0 === imgIndex ? "selected" : ""}
                alt="제품 이미지"
                onClick={() => setImageIndex(0)}
              />
              {objects?.subImg?.map((img, index) => (
                <img
                  key={index}
                  onClick={() => setImageIndex(index + 1)}
                  src={img}
                  alt="제품 이미지"
                  className={index + 1 === imgIndex ? "selected" : ""}
                />
              ))}
            </div>
          </div>
          <div className="info_box">
            <div>
              <h3
                onClick={(event) => {
                  event.preventDefault();
                  navigate(
                    `/store/brand-detail?getBrand=${objects?.brand_seq}`
                  );
                }}
              >
                {objects?.brand + " >"}{" "}
              </h3>
              <h2>{objects?.name}</h2>
              <Count>
                {objects?.sale && (
                  <span>{(objects?.count ?? 0).toLocaleString()}원</span>
                )}
                <em>
                  {handlePrice(
                    objects?.sale,
                    objects?.count,
                    objects?.discount_rate
                  ).toLocaleString()}
                  원{objects?.option && "~"}
                </em>
              </Count>
              <TagWrapper>
                {objects?.sale && <TagText className="sale">세일</TagText>}
                {objects?.coupon && <TagText className="coupon">쿠폰</TagText>}
                {handlePrice(
                  objects?.sale,
                  objects?.count,
                  objects?.discount_rate
                ) > 20000 && <TagText className="free">무배</TagText>}
              </TagWrapper>
            </div>
            <div>
              <DeliveryInfo>
                <h4>배송 정보</h4>
                <div>
                  <em>일반 배송</em>
                  <span>
                    2,500원 (20,000 원 이상 무료배송) <br /> 올리브샵 배송
                  </span>
                </div>
              </DeliveryInfo>
              <BuyContainer $soldOut={objects?.soldOut ?? true}>
                <span>구매수량</span>
                <div>
                  <button
                    className="buyMinus"
                    onClick={(event) => {
                      event.preventDefault();
                      if (objects?.soldOut) {
                        alert("품절된 상품입니다.");
                        return;
                      }
                      if (buyCount === 1) {
                        alert("1개 이상부터 구매할 수 있는 상품입니다.");
                        return;
                      }
                      setBuyCount((preState) => preState - 1);
                    }}
                  >
                    <em>-</em>
                  </button>
                  <span>{buyCount}</span>

                  <button
                    className="buyPlus"
                    onClick={(event) => {
                      event.preventDefault();
                      if (objects?.soldOut) {
                        alert("품절된 상품입니다.");
                        return;
                      }
                      setBuyCount((preState) => preState + 1);
                    }}
                  >
                    <em>+</em>
                  </button>
                </div>
              </BuyContainer>
              <PriceContainer>
                <span>
                  {(
                    handlePrice(
                      objects?.sale,
                      objects?.count,
                      objects?.discount_rate
                    ) * buyCount
                  ).toLocaleString() || 0}
                  원
                </span>
              </PriceContainer>
              <BuyButtonContainer $soldOut={objects?.soldOut ?? true}>
                {objects?.soldOut ? (
                  <button
                    className="soldOut"
                    onClick={(event) => {
                      alert("품절 입니다.");
                    }}
                  >
                    품절
                  </button>
                ) : (
                  <>
                    <button
                      className="cart"
                      type="button"
                      onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (userData === "") {
                          alert("로그인후 이용해주세요");
                          navigate("/login");
                          return;
                        } else {
                          alert("장바구니에 추가되었습니다");
                          if (!objects) return;
                          const add = addToCart({
                            dataInfo: objects,
                            addCount: buyCount,
                          });
                          if (await add) {
                            const cartCount = await handleCartCount(userData);
                            dispatch(modify(cartCount ?? 0));
                          }
                        }
                      }}
                    >
                      장바구니
                    </button>
                    <button
                      className="buy"
                      onClick={(event) => {
                        alert("준비중 입니다");
                      }}
                    >
                      바로구매
                    </button>
                  </>
                )}
              </BuyButtonContainer>
            </div>
          </div>
        </BoxContainer>
        <TabContainer>
          <div className="tabs">
            <span className="active">상세보기</span>
            <span
              onClick={() => {
                alert("준비중 입니다");
              }}
            >
              리뷰
            </span>
          </div>
          <DetailedContainer $open={detailOpened}>
            <div>
              <img src={objects?.detailImg} alt="상세이미지" />
            </div>
            <button
              className="moreButton"
              type="button"
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                setDetailOpened(!detailOpened);
              }}
            >
              상품설명 {detailOpened ? "접기" : "더보기"}
            </button>
          </DetailedContainer>
        </TabContainer>
        <SliderContainer>
          <Slider className="slider-container" {...settings}>
            {objectItems &&
              objectItems?.map((item, index) => (
                <ObjectCardRow
                  size="324px"
                  option={false}
                  imgSize="100px"
                  data={item}
                  key={index}
                />
              ))}
          </Slider>
        </SliderContainer>
      </div>
    </Center>
  );
};

const SliderContainer = styled.div`
  margin-bottom: 50px;
  border-top: 2px solid #000;
  padding-top: 30px;
  position: relative;

  .slick-prev,
  .slick-next {
    width: 25px;
    height: 25px;
    /* background-color: red; */
    &::before {
      font-size: 25px;
      color: #898989 !important;
    }
  }
  .slick-next {
    right: calc((100% - 1020px) / 2 - 40px);
  }
  .slick-prev {
    left: calc((100% - 1020px) / 2 - 40px);
    z-index: 9;
  }
  li.slick-active {
    button:before {
      /* color: red; */
    }
  }
  .best-icon {
    width: 35px;
    height: 35px;
    font-size: 9px;
    left: 5px;
    top: 5px;
    line-height: 31px !important;
  }

  .img-box em {
    font-size: 16px;
  }
`;
const DetailedContainer = styled.div<{ $open: boolean }>`
  padding: 50px 0;
  button {
    width: 720px;
    height: 50px;
    margin: 0 auto;
    display: block;
    text-align: center;
    border: 1px solid #000;
    border-radius: 4px;
    position: relative;
    font-size: 16px;
    color: #131518;
    &::after {
      content: "";
      position: absolute;
      top: -100%;
      left: 0;
      width: 100%;
      height: 47px;
      overflow: hidden;
      background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0),
        #fff
      );
    }
  }
  > div {
    height: ${({ $open }) => ($open ? "auto" : "500px")};
    overflow: ${({ $open }) => ($open ? "unset" : "hidden")};
    img {
      margin: 0 auto;
      display: block;
      width: 100%;
    }
  }
`;
const TabContainer = styled.div`
  margin-top: 60px;
  .tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    span {
      height: 60px;
      display: block;
      line-height: 60px;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid ${theme.lineColor.main};

      &.active {
        background-color: ${theme.color.main};
        color: white;
      }
    }
  }
`;
const PriceContainer = styled.div`
  padding: 15px 10px 10px;
  border-bottom: 2px solid ${theme.color.main};
  margin-top: 20px;
  span {
    font-weight: 900;
    font-size: 26px;
    text-align: right;
    display: block;
    color: ${theme.color.main};
  }
`;
const BuyContainer = styled.div<{ $soldOut: boolean }>`
  margin-top: 20px;
  border: 1px solid ${theme.lineColor.sub};
  padding: 15px 10px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    font-weight: 700;
    font-size: 16px;
  }

  > div {
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    border: 1px solid ${theme.lineColor.sub};
    span {
      cursor: unset;
      display: block;
      height: 30px;
      width: 60px;
      font-size: 20px;
      line-height: 32px;
      background-color: ${({ $soldOut }) => ($soldOut ? "#efeded" : "#fff")};
      text-align: center;
      border-right: 1px solid ${theme.lineColor.sub};
      border-left: 1px solid ${theme.lineColor.sub};
    }
    button {
      width: 30px;
      height: 30px;
      font-size: 25px;
      text-align: center;
      background-color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;
const BuyButtonContainer = styled.div<{ $soldOut: boolean }>`
  display: grid;
  margin-top: 20px;
  row-gap: 5px;
  grid-template-columns: ${({ $soldOut }) =>
    $soldOut ? "repeat(1, 1fr)" : "repeat(2, 1fr)"};
  button {
    height: 60px;
    line-height: 60px;
    font-size: 18px;
    font-weight: 800;
    border: 1px solid ${theme.lineColor.main};

    &.buy {
      background-color: ${theme.color.main};
      color: #fff;
    }

    &.soldOut {
      background-color: #f5f5f5;
    }
  }
`;
const DeliveryInfo = styled.div`
  margin-top: 26px;
  padding: 15px 10px;
  border-top: 1px solid ${theme.lineColor.main};
  border-bottom: 1px solid ${theme.lineColor.main};
  span {
    font-size: 14px;
  }
  em {
    font-size: 14px;
    display: inline-block;
    width: 60px;
  }
  em {
    font-weight: 600;
    margin-right: 5px;
  }
  > div {
    margin-top: 7px;
    display: flex;
  }
`;
const BoxContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 50px;
  margin-top: 45px;
  > div {
    min-height: 690px;
  }
  .img_box {
    > img {
      width: 485px;
      height: 485px;
      object-fit: cover;
      overflow: hidden;
      border-radius: 3px;
    }
    .all_img {
      display: flex;
      gap: 20px 10px;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px 10px;
      margin-top: 25px;
      > img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        overflow: hidden;
        border-radius: 3px;
        border: 2px solid transparent;

        &.selected {
          border: 2px solid ${theme.color.main};
        }
      }
    }
  }
  .info_box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    > div {
      > h3 {
        font-weight: 300;
        font-size: 18px;
        cursor: pointer;
      }
      > h2 {
        font-weight: 400;
        margin-top: 15px;
        font-size: 24px;
      }
    }
  }
`;
const Count = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
  margin-top: 10px;
  span {
    color: #a9a9a9;
    font-size: 18px;
    text-decoration: line-through;
    vertical-align: middle;
    font-weight: 400;
  }

  em {
    color: ${theme.fontColor.red};
    font-size: 26px;
    font-weight: 700;
  }
`;
const TagWrapper = styled.div`
  justify-content: normal !important;
  column-gap: 2px;
  display: flex;
  margin-top: 5px;
`;

const TagText = styled.span`
  color: #fff;
  padding: 4px 8px;
  border-radius: 15px;
  font-size: ${theme.fontSize.middle};
  /* margin-right: 1px; */
  &.sale {
    background-color: #f65c60;
  }
  &.coupon {
    background-color: #9bce26;
  }
  &.free {
    background-color: #ad85ed;
  }
`;

export default StoreGoodsDetail;
