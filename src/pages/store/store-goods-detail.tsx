import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import type { CardImageType, ReviewType } from "components/card/card.type";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import type { RootState } from "redux/store";
import Slider from "react-slick";
import {
  calculatePrice,
  calculatePriceNY,
  handlePrice,
  handleSaleTF,
  defaultProfile,
} from "../../utils/common";
import { useSelector, useDispatch } from "react-redux";
import ObjectCardRow from "../../components/card/ObjectCardRow";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { addProducts } from "../../redux/reducers/recentProductsData";
import { addItemCart } from "@/services/cart";
import EmptyComponent from "../../components/EmptyComponent";
import moment from "moment";
import ModalContainer from "../../components/ModalContainer";
import { Center } from "@/components/ui/Center";
import { StarBox } from "@/components/ui/FormElements";
import { cn } from "@/lib/cn";
import { Minus, Plus } from "lucide-react";

function GraphBar({ height }: { height: string }) {
  return (
    <span className="relative mx-auto my-2.5 block h-[100px] w-2 rounded-[5px] bg-[#e5e5e5]">
      <span
        className="absolute bottom-0 w-2 rounded-[5px] bg-[#f27370]"
        style={{ height }}
      />
    </span>
  );
}

const StoreGoodsDetail = () => {
  const userData = useSelector((state: RootState) => state?.user.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

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
    const { data: selectedData } = await supabase
      .from("objects")
      .select("*,saleItem(*)")
      .eq("object_seq", item)
      .single();

    const selected = !selectedData ? {} : { ...selectedData };
    const { data: brandsData } = await supabase
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

    const { data: objectData } = await supabase
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
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("*")
      .eq("objectInfo", item)
      .order("created_at", { ascending: false });

    const totalScore = reviewData?.map((item) => item?.score);

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
              userInfo: idSnapshot.docs[0].data(),
            };
          } else {
            return null;
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
    swipeToSlide: true,
    slidesToShow: 5,
    arrows: false,
    slidesToScroll: 1,
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
    if (score >= index + 1) return "100%";
    if (score > index && score < index + 1) {
      const decimal = score - index;
      return `${decimal * 100}%`;
    }
    return "0%";
  };
  const getStarIndividualWidth = (index: number, score: number) => {
    if (score >= index + 1) return "100%";
    if (score > index && score < index + 1) {
      const decimal = score - index;
      return `${decimal * 100}%`;
    }
    return "0%";
  };
  const getGraphHeight = (index: number): string => {
    if (!reviewScore || reviewScore.length === 0) return "0%";

    const count = reviewScore.filter((item) => item === index + 1).length;
    const percentage = ((count * 100) / reviewScore.length).toFixed(1);
    return `${percentage}%`;
  };

  const handleLike = async (id: string) => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    const currentLikes = data.likeUserId || [];
    let newLikes = null;

    if (data.likeUserId.includes(userData)) {
      newLikes = currentLikes.filter((id: string) => id !== userData);
    } else {
      newLikes = [...currentLikes, userData];
    }

    await supabase
      .from("reviews")
      .update({ likeUserId: newLikes })
      .eq("id", id)
      .select();

    handleReviewData(searchObject ?? "");
  };

  const soldOut = objects?.soldOut ?? true;

  return (
    <Center>
      <article role="article" aria-label="상품 상세 정보">
        <div className="mt-[45px] grid grid-cols-2 gap-x-[50px] [&>div]:min-h-[690px]">
          <div className="img_box">
            <img
              className="h-[485px] w-[485px] overflow-hidden rounded-[3px] object-cover"
              src={
                imgIndex === 0
                  ? objects?.img
                  : objects?.subImg && objects?.subImg[imgIndex - 1]
              }
              alt="제품 이미지"
            />
            <div className="all_img mt-[25px] flex flex-wrap justify-center gap-[15px_10px]">
              <img
                src={objects?.img}
                className={cn(
                  "h-20 w-20 overflow-hidden rounded-[3px] border-2 border-transparent object-cover",
                  0 === imgIndex && "border-primary"
                )}
                alt="제품 이미지"
                onClick={() => setImageIndex(0)}
              />
              {objects?.subImg?.map((img, index) => (
                <img
                  key={index}
                  onClick={() => setImageIndex(index + 1)}
                  src={img}
                  alt="제품 이미지"
                  className={cn(
                    "h-20 w-20 overflow-hidden rounded-[3px] border-2 border-transparent object-cover",
                    index + 1 === imgIndex && "border-primary"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="info_box flex min-h-[690px] flex-col justify-between">
            <div>
              <h3
                className="cursor-pointer text-lg font-light"
                onClick={(event) => {
                  event.preventDefault();
                  navigate(
                    `/store/brand-detail?getBrand=${objects?.brands?.brand_seq}`
                  );
                }}
              >
                {objects?.brands?.name + " >"}{" "}
              </h3>
              <h2 className="mt-[15px] text-2xl font-normal">{objects?.name}</h2>

              <div className="mt-2.5 flex items-center gap-2.5">
                {handleSaleTF(objects?.saleItem) && (
                  <span className="text-lg font-normal text-[#a9a9a9] line-through">
                    {(objects?.count ?? 0).toLocaleString()}원
                  </span>
                )}
                <em className="text-[26px] font-bold text-text-red">
                  {handlePrice(
                    objects?.saleItem,
                    objects?.count
                  ).toLocaleString()}
                  원{objects?.option && "~"}
                </em>
              </div>
              <div className="!justify-normal mt-[5px] flex gap-0.5 gap-px [&_span]:mr-px [&_span]:rounded-[15px] [&_span]:px-2 [&_span]:py-1 [&_span]:text-sm">
                {handleSaleTF(objects?.saleItem) && (
                  <span className="sale bg-[#f65c60] text-white">세일</span>
                )}
                {objects?.coupon && (
                  <span className="coupon bg-[#9bce26] text-white">쿠폰</span>
                )}
                {!objects?.saleItem ||
                  (objects?.saleItem?.one_more && (
                    <span className="oneMore bg-[#ff8942] text-white">
                      {objects?.saleItem?.one_more}+1
                    </span>
                  ))}
                {handlePrice(objects?.saleItem, objects?.count) >= 20000 && (
                  <span className="free bg-[#ad85ed] text-white">무배</span>
                )}
                {moment().isBetween(
                  objects?.saleItem?.start_today_sale_date,
                  objects?.saleItem?.end_today_sale_date
                ) && (
                  <span className="today_sale bg-[#6fcff7] text-white">오특</span>
                )}
              </div>
            </div>
            <div>
              <div className="mt-[26px] border-y border-line-main px-2.5 py-[15px] [&_em]:mr-[5px] [&_em]:inline-block [&_em]:w-[60px] [&_em]:text-sm [&_em]:font-semibold [&_span]:text-sm [&>div]:mt-[7px] [&>div]:flex">
                <h4>배송 정보</h4>
                <div>
                  <em>일반 배송</em>
                  <span>
                    2,500원 (20,000 원 이상 무료배송) <br /> 올리브샵 배송
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border border-line-sub bg-[#f9f9f9] px-2.5 py-[15px] [&_span]:text-base [&_span]:font-bold [&>div]:flex [&>div]:overflow-hidden [&>div]:rounded [&>div]:border [&>div]:border-line-sub [&>div_button]:flex [&>div_button]:h-[30px] [&>div_button]:w-[30px] [&>div_button]:items-center [&>div_button]:justify-center [&>div_button]:bg-white [&>div_button]:text-[25px] [&>div>span]:block [&>div>span]:h-[30px] [&>div>span]:w-[60px] [&>div>span]:cursor-default [&>div>span]:border-x [&>div>span]:border-line-sub [&>div>span]:text-center [&>div>span]:text-xl [&>div>span]:leading-8">
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
                    <Minus className="h-5 w-5" aria-hidden />
                  </button>
                  <span
                    className={cn(
                      soldOut ? "bg-[#efeded]" : "bg-white"
                    )}
                  >
                    {buyCount}
                  </span>

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
                    <Plus className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>
              {objects?.saleItem?.one_more && (
                <div className="border border-line-sub bg-[#f9f9f9] px-2.5 py-[15px] [&_em]:text-primary [&_span]:text-[15px] [&_span]:font-semibold">
                  <span>
                    <em>{objects?.saleItem?.one_more}+1</em> 적용되어 구매됩니다
                  </span>
                </div>
              )}
              <div className="mt-5 border-b-2 border-primary px-2.5 pb-2.5 pt-[15px] [&_span]:block [&_span]:text-right [&_span]:text-[26px] [&_span]:font-black [&_span]:text-primary">
                <span>
                  {calculatePrice(
                    buyCount,
                    objects?.saleItem?.one_more,
                    handlePrice(objects?.saleItem, objects?.count)
                  )?.toLocaleString() || 0}
                  원
                </span>
              </div>
              <div
                className={cn(
                  "mt-5 grid gap-[5px]",
                  soldOut ? "grid-cols-1" : "grid-cols-2",
                  "[&_button]:h-[60px] [&_button]:border [&_button]:border-line-main [&_button]:text-lg [&_button]:font-extrabold [&_button]:leading-[60px] [&_.buy]:bg-primary [&_.buy]:text-white [&_.soldOut]:bg-[#f5f5f5]"
                )}
              >
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
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[60px]">
          <div
            className="tabs grid grid-cols-2 [&_span]:block [&_span]:h-[60px] [&_span]:cursor-pointer [&_span]:border [&_span]:border-line-main [&_span]:text-center [&_span]:text-xl [&_span]:font-semibold [&_span]:leading-[60px] [&_span.active]:bg-primary [&_span.active]:text-white"
            role="tablist"
            aria-label="상품 정보 탭"
          >
            <span
              role="tab"
              aria-selected={openedTabs === 1}
              className={cn(openedTabs === 1 && "active")}
              onClick={(event) => {
                event.preventDefault();
                setOpenedTabs(1);
                setDetailOpened(false);
              }}
            >
              상세보기
            </span>
            <span
              role="tab"
              aria-selected={openedTabs === 2}
              className={cn(openedTabs === 2 && "active")}
              onClick={(event) => {
                event.preventDefault();
                setOpenedTabs(2);
              }}
            >
              리뷰 ({reviewItems?.length})
            </span>
          </div>
          {openedTabs === 1 ? (
            <div className="py-[50px]">
              <div
                className={cn(
                  detailOpened ? "h-auto overflow-visible" : "h-[500px] overflow-hidden"
                )}
              >
                <img
                  className="mx-auto block w-full"
                  src={objects?.detailImg}
                  alt="상세이미지"
                />
              </div>
              <button
                className="moreButton relative mx-auto mt-0 block h-[50px] w-[720px] rounded border border-black text-center text-base text-[#131518] after:absolute after:left-0 after:top-[-100%] after:h-[47px] after:w-full after:bg-gradient-to-b after:from-white/0 after:to-white"
                type="button"
                onClick={async (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDetailOpened(!detailOpened);
                }}
              >
                상품설명 {detailOpened ? "접기" : "더보기"}
              </button>
            </div>
          ) : (
            <div style={{ padding: "50px 0" }}>
              {reviewItems?.length > 0 ? (
                <div>
                  <div className="score-graph grid grid-cols-2">
                    <div className="score flex flex-col items-center justify-center gap-3 [&_em]:text-[35px] [&_em]:font-black [&>span]:text-lg [&>span]:font-bold">
                      <span>총 {reviewItems?.length?.toLocaleString()}건</span>
                      <em>
                        {Math.floor(
                          ((reviewScore ?? [])?.reduce((a, c) => a + c) /
                            (reviewScore?.length || 0)) *
                            10
                        ) / 10}{" "}
                        점
                      </em>
                      <ul className="star-box flex gap-[7px] [&_img]:absolute [&_img]:z-[9] [&_img]:h-[26px] [&_img]:w-[26px] [&_img]:overflow-hidden [&_li]:relative [&_li]:h-[26px] [&_li]:w-[26px] [&_span]:absolute [&_span]:left-0 [&_span]:top-0 [&_span]:z-[4] [&_span]:block [&_span]:h-[26px] [&_span]:w-full [&_span]:bg-[#f27370]">
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
                    <div className="graph [&_em]:block [&_em]:text-center [&_em]:text-sm [&_em]:font-bold [&_em]:text-[#aaa] [&_ul]:flex [&_ul]:justify-center">
                      <ul>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <li key={i} className="w-14">
                            <em>{getGraphHeight(i)}</em>
                            <GraphBar height={getGraphHeight(i)} />
                            <em style={{ color: "#888" }}>{i + 1}점</em>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {reviewImages?.length > 0 && (
                    <div className="reviews-img my-5 grid grid-cols-8 justify-between border-y border-line-sub px-0 py-[30px] pb-5 [grid-template-columns:repeat(8,120px)]">
                      {reviewImages?.map(
                        (item, index) =>
                          index < 8 && (
                            <div
                              key={index}
                              className={cn(
                                "relative h-[120px] w-[120px] cursor-pointer overflow-hidden rounded-[5px] border border-line-main",
                                index === 7 && "[&_em]:block [&_img]:brightness-[0.8]"
                              )}
                              onClick={(event) => {
                                event.preventDefault();
                                if (index === 7) {
                                  setImgOpened(true);
                                } else {
                                  setDetailImgIndex(item?.index ?? "0");
                                  setDetailReviews(item);
                                  setDetailImgOpened(true);
                                }
                              }}
                            >
                              <em
                                className={cn(
                                  "absolute inset-0 z-[19] hidden text-center leading-[120px] text-white",
                                  index === 7 && "block"
                                )}
                              >
                                더보기{" "}
                              </em>
                              <img
                                className="h-full w-full"
                                src={item?.img || ""}
                                alt="reviews-img"
                              />
                            </div>
                          )
                      )}
                    </div>
                  )}

                  <div className="reviews-box">
                    {reviewItems?.map((item, index) => (
                      <div
                        key={index}
                        className="flex border-b border-line-main py-[15px]"
                      >
                        <div className="user-info flex h-fit w-[255px] items-center gap-[15px] [&_em]:w-[calc(100%-100px)] [&_em]:overflow-hidden [&_em]:text-ellipsis [&_em]:whitespace-nowrap [&_em]:text-base [&_em]:font-bold [&_em]:leading-[19px] [&_em]:text-[#131518] [&>div]:h-[60px] [&>div]:w-[60px] [&>div]:overflow-hidden [&>div]:rounded-full [&>div]:border [&>div]:border-line-main [&_img]:h-full [&_img]:w-full">
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
                        <div className="reviews flex w-[calc(100%-255px)] flex-col gap-3 [&>span]:inline-block [&>span]:text-base [&>span]:leading-6 [&>span]:text-[#555]">
                          <div className="score-date flex flex-row items-center gap-5 [&_em]:font-normal [&_em]:text-[#888]">
                            <StarBox
                              size="23px"
                              className="star-box [&_img]:absolute [&_img]:z-[9] [&_img]:h-[23px] [&_img]:w-[23px] [&_li]:relative [&_li]:h-[23px] [&_li]:w-[23px] [&_span]:absolute [&_span]:left-0 [&_span]:top-0 [&_span]:z-[4] [&_span]:block [&_span]:h-[23px] [&_span]:w-full [&_span]:bg-[#f27370]"
                            >
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
                              <div className="[&_.img]:relative [&_.img]:!h-[148px] [&_.img]:!w-[148px] [&_.img]:overflow-hidden [&_.img]:rounded-[5px] [&_.img]:border [&_.img]:border-[#d9d9d9] [&_.img]:after:absolute [&_.img]:after:bottom-2.5 [&_.img]:after:right-2.5 [&_.img]:after:h-5 [&_.img]:after:w-5 [&_.img]:after:bg-[url(https://static.oliveyoung.co.kr/pc-static-root/image/product/ico_image_more.png)] [&_.img]:after:bg-[length:20px_auto] [&_.img]:after:bg-no-repeat [&_.img]:after:content-[''] [&_.img_img]:h-full [&_.img_img]:w-full [&_.slick-active]:border-none [&_.slick-track]:ml-[unset]">
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
                              </div>
                            </div>
                          )}
                          <span>{item?.reviewText}</span>
                          {
                            <div
                              className={cn(
                                "like-box flex items-center gap-[15px] [&_button]:h-[25px] [&_button]:w-[60px] [&_button]:rounded-[20px] [&_button]:border [&_button]:border-[#131518] [&_button]:text-base [&_button]:text-[#131518]",
                                item.likeUserId?.includes(userData) &&
                                  "[&_button]:border-primary [&_button]:bg-primary [&_button]:text-white",
                                item.userId === userData &&
                                  "[&_button]:border-[#ccc] [&_button]:bg-[#eeeeee] [&_button]:text-[#333333]"
                              )}
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
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyComponent mainText="등록된 리뷰가 없습니다." subText="" />
              )}
            </div>
          )}
        </div>
        <div className="relative mb-[50px] border-t-2 border-black pt-[30px] [&_.best-icon]:absolute [&_.best-icon]:left-[5px] [&_.best-icon]:top-[5px] [&_.best-icon]:h-[35px] [&_.best-icon]:w-[35px] [&_.best-icon]:text-[9px] [&_.best-icon]:leading-[31px] [&_.img-box_em]:text-base [&_.slick-next]:right-[calc((100%-1020px)/2-40px)] [&_.slick-next]:h-[25px] [&_.slick-next]:w-[25px] [&_.slick-next:before]:text-[25px] [&_.slick-next:before]:!text-[#898989] [&_.slick-prev]:left-[calc((100%-1020px)/2-40px)] [&_.slick-prev]:z-[9] [&_.slick-prev]:h-[25px] [&_.slick-prev]:w-[25px] [&_.slick-prev:before]:text-[25px] [&_.slick-prev:before]:!text-[#898989]">
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
        </div>
        <ModalContainer
          isOpen={imgOpened}
          onClose={() => setImgOpened(false)}
          widthCheck={"800px"}
          header="사진목록"
          heightCheck="500px"
          okText="취소"
        >
          {reviewImages?.length > 0 && (
            <div className="grid h-full w-full grid-cols-[repeat(9,80px)] gap-[5px] overflow-x-hidden overflow-y-auto [grid-auto-rows:max-content] [&>div]:h-20 [&>div]:w-20 [&_img]:h-full [&_img]:w-full">
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
            </div>
          )}
        </ModalContainer>
        <ModalContainer
          isOpen={detailImgOpened}
          onClose={() => setDetailImgOpened(false)}
          widthCheck={"850px"}
          header="포토 상세"
          heightCheck="600px"
        >
          <div className="grid h-full grid-cols-3 gap-x-5 py-[30px]">
            <div className="img-wrap col-span-2 [&_img]:h-full [&_img]:w-full">
              <div className="main-img h-[calc(100%-90px)] w-full border border-line-main">
                <img
                  src={detailReviews?.reviewImg?.[Number(detailImgIndex)] ?? ""}
                  alt=""
                />
              </div>
              <div className="sub-img mt-2.5 [&_img]:border [&_img]:border-line-main">
                <div className="[&_.slick-slide]:h-20 [&_.slick-slide]:w-20 [&_.slick-slide]:pr-[5px] [&_.slick-slide:last-child]:pr-0 [&_.slick-track]:ml-[unset]">
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
                </div>
              </div>
            </div>
            <div className="info col-span-1">
              <div className="reviews flex flex-col gap-2 [&>span]:inline-block [&>span]:text-base [&>span]:leading-6 [&>span]:text-[#555]">
                <div className="user-info flex h-fit w-[255px] items-center gap-[7px] [&_em]:w-[calc(100%-100px)] [&_em]:overflow-hidden [&_em]:text-ellipsis [&_em]:whitespace-nowrap [&_em]:text-base [&_em]:font-bold [&_em]:leading-[19px] [&_em]:text-[#131518] [&>div]:h-[50px] [&>div]:w-[50px] [&>div]:overflow-hidden [&>div]:rounded-full [&>div]:border [&>div]:border-line-main [&_img]:h-full [&_img]:w-full">
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
                <StarBox className="star-box flex gap-1 [&_img]:absolute [&_img]:z-[9] [&_img]:h-5 [&_img]:w-5 [&_li]:relative [&_li]:h-5 [&_li]:w-5 [&_span]:absolute [&_span]:left-0 [&_span]:top-0 [&_span]:z-[4] [&_span]:block [&_span]:h-5 [&_span]:w-full [&_span]:bg-[#f27370]">
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

                <span>{detailReviews?.reviewText}</span>
              </div>
            </div>
          </div>
        </ModalContainer>
      </article>
    </Center>
  );
};

export default StoreGoodsDetail;
