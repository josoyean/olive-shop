import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Center, StarBox, Tags } from "../../../public/assets/style";
import { theme } from "../../../public/assets/styles/theme";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import type { CardImageType, ReviewType } from "compontents/card/card.type";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import type { RootState } from "redex/store";
import Slider from "react-slick";
import {
  calculatePrice,
  calculatePriceNY,
  handlePrice,
  handleCartCount,
  handleSaleTF,
  defaultProfile,
} from "../../bin/common";
import { useSelector, useDispatch } from "react-redux";
import { modify } from "../../redex/reducers/userCartCount";
import ObjectCardRow from "../../compontents/card/ObjectCardRow";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  addProducts,
  clearProducts,
} from "../../redex/reducers/recentProductsData";
import { addItemCart } from "../../pages/carts/addItemCart";
import EmptyComponent from "../../compontents/EmptyComponent";
import { dividerClasses } from "@mui/material";
import moment from "moment";
import ModalContainer from "../../compontents/ModalContainer";
interface Test {
  [key: string]: number;
}
const StoreGoodsDetail = () => {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD 형식)
  const productData = useSelector((state: RootState) => state?.recentProducts);
  const userData = useSelector((state: RootState) => state?.user.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [objects, setObjects] = useState<CardImageType>();
  const [objectItems, setObjectItems] = useState<CardImageType[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewType[]>([]);
  const [reviewImages, setReviewImages] = useState<ReviewType[]>([]);
  const [imgIndex, setImageIndex] = useState<number>(0);
  const [buyCount, setBuyCount] = useState<number>(1);
  const [detailOpened, setDetailOpened] = useState<boolean>(false);
  const [openedTabs, setOpenedTabs] = useState<number>(1);
  const [reviewScore, setReviewSore] = useState<number[]>();
  const searchObject = searchParams.get("getGoods");
  const [detailReviews, setDetailReviews] = useState<ReviewType>({});

  const [detailImgOpened, setDetailImgOpened] = useState<boolean>(false);
  const [detailImgIndex, setDetailImgIndex] = useState<string>("0");
  const [imgOpened, setImgOpened] = useState<boolean>(false);
  const handleData = async (item: string) => {
    const { data: selectedData, error: cartError } = await supabase
      .from("objects")
      .select("*,saleItem(*)")
      .eq("object_seq", item)
      .single();

    const selected = !selectedData ? {} : { ...selectedData };
    const { data: brandsData, error: brandsError } = await supabase
      .from("brands")
      .select("*")
      .eq("brand_seq", selected?.brand_seq)
      .single();

    const data = {
      ...selected,
      brands: brandsData,
    };

    setObjects(data);
    dispatch(addProducts(selected));

    const { data: objectData, error } = await supabase
      .from("objects")
      .select("*,saleItem(*)");
    setObjectItems(
      !objectData
        ? []
        : objectData?.filter((data) => data?.object_seq !== Number(item))
    );

    handleReviewData(item);
  };

  const handleReviewData = async (item: string) => {
    const { data: reviewData, reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("objectInfo", item)
      .order("created_at", { ascending: false });

    const totalScore = reviewData?.map((item) => item?.score);
    // const img = reviewData?.flatMap((item) => item?.reviewImg);

    setReviewSore(totalScore ?? []);

    const reviews = await handleReview(reviewData ?? []);

    setReviewItems(reviews ?? []);
    const img =
      (reviews?.flatMap((item) =>
        item?.reviewImg?.map((img, index) => {
          return { ...item, img: img, index: String(index) };
        })
      ) as ReviewType[]) ?? [];

    setReviewImages(img ?? []);
  };

  const handleReview = async (data: ReviewType[]): Promise<ReviewType[]> => {
    const updatedData = await Promise.all(
      (data.map(async (item) => {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("userId", "==", item.userId));
          const idSnapshot = await getDocs(q);

          if (!idSnapshot.empty) {
            return {
              ...item,
              userInfo: idSnapshot.docs[0].data(), // null 제거
            };
          } else {
            return null; // 유저가 없으면 null 반환
          }
        } catch (error) {
          console.error("에러 발생:", error);
          return null;
        }
      }) as ReviewType[]) ?? []
    );

    return (updatedData ?? [])?.filter(Boolean);
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
    autoplaySpeed: 5000,
    arrows: true,
  };
  const reviewSettings = {
    infinite: false,
    // speed: 500,
    swipeToSlide: true,
    slidesToShow: 5,
    arrows: false,
    slidesToScroll: 1,
    // centerMode: true,
    // centerPadding: "0px",
    // variableWidth: "120px",
  };

  const detailSettings = {
    infinite: false,
    swipeToSlide: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    focusOnSelect: true,
  };
  const getStarWidth = (index: number) => {
    const score =
      (reviewScore ?? [])?.reduce((a, c) => a + c) / (reviewScore?.length || 0);
    if (score >= index + 1) return "100%"; // 꽉 찬 별
    if (score > index && score < index + 1) {
      const decimal = score - index;
      return `${decimal * 100}%`; // 일부만 채운 별
    }
    return "0%"; // 비어있는 별
  };
  const getStarIndividualWidth = (index: number, score: number) => {
    if (score >= index + 1) return "100%"; // 꽉 찬 별
    if (score > index && score < index + 1) {
      const decimal = score - index;
      return `${decimal * 100}%`; // 일부만 채운 별
    }
    return "0%"; // 비어있는 별
  };
  const getGraphHeight = (index: number): string => {
    if (!reviewScore || reviewScore.length === 0) return "0%";

    const count = reviewScore.filter((item) => item === index + 1).length;
    const percentage = ((count * 100) / reviewScore.length).toFixed(1);
    return `${percentage}%`;
  };

  const handleLike = async (id: string) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    const currentLikes = data.likeUserId || [];
    let newLikes = null;

    if (data.likeUserId.includes(userData)) {
      // 좋아요 누름
      newLikes = currentLikes.filter((id: string) => id !== userData);
    } else {
      // 종아요 안누름
      newLikes = [...currentLikes, userData];
    }

    await supabase
      .from("reviews")
      .update({ likeUserId: newLikes })
      .eq("id", id)
      .select();

    handleReviewData(searchObject ?? "");
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
                    `/store/brand-detail?getBrand=${objects?.brands?.brand_seq}`
                  );
                }}
              >
                {objects?.brands?.name + " >"}{" "}
              </h3>
              <h2>{objects?.name}</h2>

              <Count>
                {handleSaleTF(objects?.saleItem) && (
                  <span>{(objects?.count ?? 0).toLocaleString()}원</span>
                )}
                <em>
                  {handlePrice(
                    objects?.saleItem,
                    objects?.count
                  ).toLocaleString()}
                  원{objects?.option && "~"}
                </em>
              </Count>
              <TagWrapper>
                {handleSaleTF(objects?.saleItem) && (
                  <span className="sale">세일</span>
                )}
                {objects?.coupon && <span className="coupon">쿠폰</span>}
                {!objects?.saleItem ||
                  (objects?.saleItem?.one_more && (
                    <span className="oneMore">
                      {objects?.saleItem?.one_more}+1
                    </span>
                  ))}
                {handlePrice(objects?.saleItem, objects?.count) >= 20000 && (
                  <span className="free">무배</span>
                )}
                {today === objects?.saleItem?.today_sale_date && (
                  <span className="today_sale">오특</span>
                )}
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
              {objects?.saleItem?.one_more && (
                <OneMoreContainer>
                  <span>
                    <em>{objects?.saleItem?.one_more}+1</em> 적용되어 구매됩니다
                  </span>
                </OneMoreContainer>
              )}
              <PriceContainer>
                <span>
                  {calculatePrice(
                    buyCount,
                    objects?.saleItem?.one_more,
                    handlePrice(objects?.saleItem, objects?.count)
                  )?.toLocaleString() || 0}
                  원
                </span>
              </PriceContainer>
              <BuyButtonContainer $soldOut={objects?.soldOut ?? true}>
                {objects?.soldOut ? (
                  <button
                    className="soldOut"
                    onClick={(event) => {
                      event.preventDefault();
                      alert("품절된 상품입니다.");
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
                          if (
                            window.confirm(
                              `로그인후 이용해주세요\n로그인 하시겠습니까?`
                            )
                          ) {
                            navigate("/login");
                            return;
                          }
                        } else {
                          if (!objects) return;

                          addItemCart({
                            objects: { ...objects, addCount: buyCount },
                            dispatch: dispatch,
                          });
                        }
                      }}
                    >
                      장바구니
                    </button>
                    <button
                      className="buy"
                      onClick={(event) => {
                        event.preventDefault();
                        if (userData === "") {
                          if (
                            window.confirm(
                              `로그인후 이용해주세요\n로그인 하시겠습니까?`
                            )
                          ) {
                            navigate("/login");
                            return;
                          }
                        }

                        if (
                          objects?.saleItem !== null &&
                          calculatePriceNY(
                            buyCount,
                            objects?.saleItem?.one_more
                          )
                        ) {
                          alert("추가상품을 선택해주세요.");
                          return;
                        }
                        const totalCount = calculatePrice(
                          buyCount,
                          objects?.saleItem?.one_more,
                          handlePrice(null, objects?.count)
                        );
                        const totalPrice = calculatePrice(
                          buyCount,
                          objects?.saleItem?.one_more,
                          handlePrice(objects?.saleItem, objects?.count)
                        );

                        navigate("/store/mypage/user-cart?t_header_type=2", {
                          state: {
                            products: [
                              {
                                objects,
                                object_count: buyCount,
                                object_seq: objects?.object_seq,
                              },
                            ],
                            searchParams: { t_header_type: "2" },
                            price: {
                              totalCount: totalCount || 0,
                              disCount: (totalCount || 0) - (totalPrice || 0),
                              totalPrice: totalPrice || 0,
                            },
                          },
                        });
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
            <span
              className={`${openedTabs === 1 && "active"}`}
              onClick={(event) => {
                event.preventDefault();
                setOpenedTabs(1);
                setDetailOpened(false);
              }}
            >
              상세보기
            </span>
            <span
              className={`${openedTabs === 2 && "active"}`}
              onClick={(event) => {
                event.preventDefault();
                setOpenedTabs(2);
              }}
            >
              리뷰 ({reviewItems?.length})
            </span>
          </div>
          {openedTabs === 1 ? (
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
          ) : (
            <div style={{ padding: "50px 0" }}>
              {reviewItems?.length > 0 ? (
                <ReviewsContainer>
                  <div className="score-graph">
                    <div className="score">
                      <span>총 {reviewItems?.length?.toLocaleString()}건</span>
                      <em>
                        {Math.floor(
                          ((reviewScore ?? [])?.reduce((a, c) => a + c) /
                            (reviewScore?.length || 0)) *
                            10
                        ) / 10}{" "}
                        점
                      </em>
                      <ul className="star-box">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <li key={i}>
                            <span
                              className="rating"
                              style={{ width: getStarWidth(i) }}
                            ></span>
                            <img
                              src="/public/assets/images/icons/bg_rating_star.png"
                              alt="bg_rating_star"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="graph">
                      <ul>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <li key={i}>
                            <em>{getGraphHeight(i)}</em>
                            <GraphHeight
                              height={getGraphHeight(i)}
                            ></GraphHeight>
                            <em style={{ color: "#888" }}>{i + 1}점</em>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {reviewImages?.length > 0 && (
                    <div className="reviews-img">
                      {reviewImages?.map(
                        (item, index) =>
                          index < 8 && (
                            <ReviewImg
                              key={index}
                              $last={index === 7 ? "block" : "none"}
                              onClick={(event) => {
                                event.preventDefault();
                                if (index === 7) {
                                  // 더보기 클릭
                                  setImgOpened(true);
                                } else {
                                  // 일반 사진 클릭
                                  setDetailImgIndex(item?.index ?? "0");
                                  setDetailReviews(item);
                                  setDetailImgOpened(true);
                                }
                              }}
                            >
                              <em>더보기 </em>
                              <img src={item?.img || ""} alt="reviews-img" />
                            </ReviewImg>
                          )
                      )}
                    </div>
                  )}

                  <div className="reviews-box">
                    {reviewItems?.map((item, index) => (
                      <ReviewBox key={index}>
                        <div className="user-info">
                          <div>
                            <img
                              src={item?.userInfo?.profileImg || defaultProfile}
                              alt="profileImg"
                            />
                          </div>
                          <em>
                            {item?.userInfo?.nickName || item?.userInfo?.name}
                          </em>
                        </div>
                        <div className="reviews">
                          <div className="score-date">
                            <StarBox size="23px" className="star-box">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <li key={i}>
                                  <span
                                    className="rating"
                                    style={{
                                      width: getStarIndividualWidth(
                                        i,
                                        item?.score ?? 0
                                      ),
                                    }}
                                  ></span>
                                  <img
                                    src="/public/assets/images/icons/bg_rating_star.png"
                                    alt="bg_rating_star"
                                  />
                                </li>
                              ))}
                            </StarBox>
                            <em>
                              {moment(item?.created_at).format("YYYY.MM.DD")}
                            </em>
                          </div>
                          {item?.reviewImg && item?.reviewImg?.length > 0 && (
                            <div className="img-box">
                              <ImgSliderContainer>
                                <Slider
                                  className="slider-container "
                                  {...reviewSettings}
                                >
                                  {item?.reviewImg?.map((img, index) => (
                                    <div
                                      key={index}
                                      className="img"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        setDetailImgIndex(String(index));
                                        setDetailReviews(item);
                                        setDetailImgOpened(true);
                                      }}
                                    >
                                      <img src={img} alt="리뷰 이미지" />
                                    </div>
                                  ))}
                                </Slider>
                              </ImgSliderContainer>
                            </div>
                          )}
                          <span>{item?.reviewText}</span>
                          {/* item.userId !== userData && */}
                          {
                            <div
                              className={`${
                                item.likeUserId?.includes(userData) ? "on" : ""
                              } ${
                                item.userId === userData ? "my-review" : ""
                              } like-box`}
                            >
                              <strong>이 리뷰가 도움이 돼요! </strong>
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  if (!userData) {
                                    if (
                                      window.confirm(
                                        `로그인후 이용해주세요\n로그인 하시겠습니까?`
                                      )
                                    ) {
                                      navigate("/login");
                                      return;
                                    }
                                  }
                                  if (item.userId === userData) return;
                                  handleLike(userData);
                                }}
                              >
                                {item?.likeUserId?.length}
                              </button>
                            </div>
                          }
                        </div>
                      </ReviewBox>
                    ))}
                  </div>
                </ReviewsContainer>
              ) : (
                <EmptyComponent mainText="등록된 리뷰가 없습니다." subText="" />
              )}
            </div>
          )}
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
                  onClick={() => {
                    setOpenedTabs(1);
                    setDetailOpened(false);
                    window.scrollTo(0, 0);
                  }}
                />
              ))}
          </Slider>
        </SliderContainer>
        <ModalContainer
          isOpen={imgOpened}
          onClose={() => setImgOpened(false)}
          widthCheck={"800px"}
          header="사진목록"
          heightCheck="500px"
          okText="취소"
        >
          {reviewImages?.length > 0 && (
            <ReviewImagesModal>
              {reviewImages?.map((item, index) => (
                <div
                  key={index}
                  onClick={(event) => {
                    event.preventDefault();
                    setDetailImgOpened(true);
                    setDetailImgIndex(item?.index ?? "0");
                    setDetailReviews(item);
                  }}
                >
                  <img src={item?.img} alt="사진목록 이미지" />
                </div>
              ))}
            </ReviewImagesModal>
          )}
        </ModalContainer>
        <ModalContainer
          isOpen={detailImgOpened}
          onClose={() => setDetailImgOpened(false)}
          widthCheck={"850px"}
          header="포토 상세"
          heightCheck="600px"
        >
          <DetailReview>
            <div className="img-wrap">
              <div className="main-img">
                <img
                  src={detailReviews?.reviewImg?.[Number(detailImgIndex)] ?? ""}
                  alt=""
                />
              </div>
              <div className="sub-img">
                <DetailSliderContainer>
                  <Slider
                    className="slider-container "
                    {...detailSettings}
                    initialSlide={0}
                  >
                    {detailReviews?.reviewImg?.map((item, index) => (
                      <div
                        key={index}
                        onClick={(event) => {
                          event.preventDefault();
                          setDetailImgIndex(String(index));
                        }}
                      >
                        <img src={item ?? ""} alt="" />
                      </div>
                    ))}
                  </Slider>
                </DetailSliderContainer>
              </div>
            </div>
            <div className="info">
              <div className="reviews">
                <div className="user-info">
                  <div>
                    <img
                      src={
                        detailReviews?.userInfo?.profileImg || defaultProfile
                      }
                      alt="profileImg"
                    />
                  </div>
                  <em>
                    {detailReviews?.userInfo?.nickName ||
                      detailReviews?.userInfo?.name}
                  </em>
                </div>
                <StarBox className="star-box">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <li key={i}>
                      <span
                        className="rating"
                        style={{
                          width: getStarIndividualWidth(
                            i,
                            detailReviews?.score ?? 0
                          ),
                        }}
                      ></span>
                      <img
                        src="/public/assets/images/icons/bg_rating_star.png"
                        alt="bg_rating_star"
                      />
                    </li>
                  ))}
                </StarBox>
                <em>
                  {moment(detailReviews?.created_at).format("YYYY.MM.DD")}
                </em>
                {/* </div> */}

                <span>{detailReviews?.reviewText}</span>
              </div>
            </div>
          </DetailReview>
        </ModalContainer>
      </div>
    </Center>
  );
};
const DetailSliderContainer = styled.div`
  .slick-track {
    margin-left: unset;
  }
  .slick-slide {
    width: 80px;
    height: 80px;
    padding-right: 5px;
    &:last-child {
      padding-right: 0;
    }
    /* margin: 0 5px; */
    > div {
      /* margin: 0 -5px; */
      width: 100%;
      height: 100%;
      > div {
        height: 100%;
      }
    }
  }
`;
const DetailReview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 20px;
  height: 100%;
  padding: 30px 0;
  .img-wrap {
    grid-column: 1 / span 2;
    .main-img {
      width: 100%;
      height: calc(100% - 90px);
      border: 1px solid ${({ theme }) => theme.lineColor.main};
    }
    .sub-img {
      margin-top: 10px;
      img {
        border: 1px solid ${({ theme }) => theme.lineColor.main};
      }
    }
    img {
      width: 100%;
      height: 100%;
    }
  }

  .info {
    grid-column: 3 / span 1;
  }

  .user-info {
    display: flex;
    width: 255px;
    column-gap: 7px;
    align-items: center;
    height: fit-content;
    > div {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid ${({ theme }) => theme.lineColor.main};
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
    }

    em {
      width: calc(100% - 100px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 700;
      font-size: 16px;
      line-height: 19px;
      color: #131518;
    }
  }

  .reviews {
    display: flex;
    flex-direction: column;
    row-gap: 8px;

    > span {
      color: #555;
      line-height: 24px;
      font-size: 16px;
      display: inline-block;
    }
  }

  .star-box {
    display: flex;
    column-gap: 4px;
    li {
      width: 20px;
      height: 20px;
      position: relative;
    }
    span {
      position: absolute;
      z-index: 4;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      height: 20px;
      background-color: #f27370;
    }
    img {
      width: 20px;
      height: 20px;
      z-index: 9;
      position: absolute;
      overflow: hidden;
    }
  }
`;
const ReviewImagesModal = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  width: 100%;
  grid-auto-rows: max-content;
  grid-template-columns: repeat(9, 80px);
  gap: 5px;
  > div {
    width: 80px;
    height: 80px;
    img {
      width: 100%;
      height: 100%;
    }
  }
`;
const ReviewBox = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid ${({ theme }) => theme.lineColor.main};
  display: flex;
  .user-info {
    display: flex;
    width: 255px;
    column-gap: 15px;
    align-items: center;
    height: fit-content;
    > div {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid ${({ theme }) => theme.lineColor.main};
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
    }

    em {
      width: calc(100% - 100px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 700;
      font-size: 16px;
      line-height: 19px;
      color: #131518;
    }
  }
  .score-date {
    display: flex;
    flex-direction: row;
    column-gap: 20px;
    align-items: center;
    em {
      color: #888;
      font-weight: 400;
    }
  }

  .reviews {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    width: calc(100% - 255px);
    > span {
      color: #555;
      line-height: 24px;
      font-size: 16px;
      display: inline-block;
    }
  }
  .img-box {
  }
  .like-box {
    display: flex;
    align-items: center;
    column-gap: 15px;
    button {
      width: 60px;
      border: 1px solid #131518;
      color: #131518;
      height: 25px;
      border-radius: 20px;
      font-size: 16px;
    }

    &.on {
      button {
        background-color: #116dff;
        border: 1px solid #116dff;
        color: #fff;
      }
    }
    &.my-review {
      button {
        background-color: #eeeeee;
        border: 1px solid #ccc;
        color: #333333;
      }
    }
  }
`;
const ImgSliderContainer = styled.div`
  .slick-active {
    border: none;
  }
  .slick-track {
    margin-left: unset;
  }
  .img {
    width: 148px !important;
    border: 1px solid #d9d9d9;
    border-radius: 5px;
    overflow: hidden;
    //width: 165px !important;
    //padding-right: 10px;
    height: 148px;
    position: relative;
    &::after {
      position: absolute;
      right: 10px;
      bottom: 10px;
      content: "";
      width: 20px;
      height: 20px;
      background: url(https://static.oliveyoung.co.kr/pc-static-root/image/product/ico_image_more.png)
        0 0 / 20px auto no-repeat;
    }
    img {
      width: 100%;
      height: 100%;
    }
  }
`;
const ReviewImg = styled.div<{ $last: string }>`
  width: 120px;
  height: 120px;
  border: 1px solid ${({ theme }) => theme.lineColor.main};
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  img {
    width: 100%;
    filter: ${(props) =>
      props.$last === "block" ? "brightness(0.8)" : "none"};
    height: 100%;
  }
  em {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: ${(props) => props.$last};
    //display: block;
    z-index: 19;
    text-align: center;
    line-height: 120px;
    color: #fff;
  }
`;

const GraphHeight = styled.span<{ height: string }>`
  display: block;
  width: 8px;
  border-radius: 5px;
  margin: 10px auto;
  background-color: #e5e5e5;
  height: 100px;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    width: 8px;
    bottom: 0;
    height: ${(theme) => theme.height};
    background-color: #f27370;
    border-radius: 5px;
  }
`;
const ReviewsContainer = styled.div`
  .score-graph {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    .score {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      row-gap: 12px;
      > span {
        font-size: 18px;
        font-weight: 700;
      }
      em {
        font-size: 35px;
        font-weight: 900;
      }
    }

    .star-box {
      display: flex;
      column-gap: 7px;
      li {
        width: 26px;
        height: 26px;
        position: relative;
      }
      span {
        position: absolute;
        z-index: 4;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 26px;
        background-color: #f27370;
      }
      img {
        width: 26px;
        height: 26px;
        z-index: 9;
        position: absolute;
        overflow: hidden;
      }
    }

    .graph {
      ul {
        display: flex;
        justify-content: center;
        li {
          width: 56px;
          /* display: flex; */
          /* flex-direction: column; */
          /* align-items: center; */

          em {
            text-align: center;
            display: block;
            font-size: 14px;
            color: #aaa;
            font-weight: 700;
          }
        }
      }
    }
  }

  .reviews-img {
    display: grid;
    justify-content: space-between;
    padding: 30px 0 20px 0;
    margin: 20px 0;
    border-bottom: 1px solid ${theme.lineColor.sub};
    border-top: 1px solid ${theme.lineColor.sub};
    grid-template-columns: repeat(8, 120px);
  }
`;
const OneMoreContainer = styled.div`
  border: 1px solid ${theme.lineColor.sub};
  padding: 15px 10px;
  background-color: #f9f9f9;
  /* margin-top: 20px; */
  span {
    font-weight: 600;
    font-size: 15px;
    em {
      color: ${theme.color.main};
    }
  }
`;
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
const TagWrapper = styled(Tags)`
  justify-content: normal !important;
  column-gap: 2px;
  display: flex;
  margin-top: 5px;
  span {
    font-size: ${theme.fontSize.middle};
    padding: 4px 8px;
    border-radius: 15px;
    font-size: ${theme.fontSize.middle};
    margin-right: 1px;
  }
`;

export default StoreGoodsDetail;
