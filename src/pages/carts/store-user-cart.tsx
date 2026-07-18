import { useEffect, useState } from "react";
import { Center } from "@/components/ui/Center";
import { TableWrapper } from "@/components/ui/FormElements";
import { cn } from "@/lib/cn";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { CardImageType, CartType } from "@/components/card/card.type";
import moment from "moment";
import {
  calculatePrice,
  handleCartItems,
  handlePrice,
  handleSaleTF,
} from "../../utils/common";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import StoreUserPayment from "./store-user-cart-payment";
import StoreUserOrder from "./store-user-order";
import { modifyCartItems } from "@/services/cart";
import EmptyComponent from "../../components/EmptyComponent";
import { cartDataDelete, userCartData } from "../../api/axios-index";
export interface PriceType {
  [key: string]: number;
}

const tagClasses = "text-white px-1.5 py-0.5 rounded-[10px] text-xs mr-0.5 text-white";
const buttonBoxClasses =
  "text-center [&_button]:h-7 [&_button]:w-[95px] [&_button]:rounded-[5px] [&_button]:px-[5px] [&_button]:text-xs [&_button]:leading-7";
const informationClasses = cn(
  "flex items-center gap-5",
  "[&_.img-wrapper]:relative [&_.img-wrapper]:h-[85px] [&_.img-wrapper]:w-[85px] [&_.img-wrapper]:overflow-hidden [&_.img-wrapper]:rounded-[10px]",
  "[&_.img-wrapper_img]:h-[85px] [&_.img-wrapper_img]:w-[85px]",
  "[&_.img-wrapper_span]:absolute [&_.img-wrapper_span]:bottom-0 [&_.img-wrapper_span]:left-0 [&_.img-wrapper_span]:right-0 [&_.img-wrapper_span]:h-[22px] [&_.img-wrapper_span]:bg-black/50 [&_.img-wrapper_span]:text-center [&_.img-wrapper_span]:text-xs [&_.img-wrapper_span]:leading-[22px] [&_.img-wrapper_span]:text-white",
  "[&_.infor-wrapper]:max-w-[228px] [&_.infor-wrapper_span]:mb-1 [&_.infor-wrapper_span]:block [&_.infor-wrapper_span]:font-bold [&_.infor-wrapper_span]:text-[#fff]",
  "[&_.infor-wrapper_em]:mb-1 [&_.infor-wrapper_em]:block [&_.infor-wrapper_em]:text-xs [&_.infor-wrapper_em]:font-bold [&_.infor-wrapper_em]:text-[#fff]",
  "[&_.infor-wrapper_p]:mb-[5px] [&_.infor-wrapper_p]:line-clamp-2 [&_.infor-wrapper_p]:max-h-9 [&_.infor-wrapper_p]:overflow-hidden [&_.infor-wrapper_p]:text-sm [&_.infor-wrapper_p]:leading-[18px] [&_.infor-wrapper_p]:text-black"
);

const StoreUserCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const locatiton = useLocation();

  const [searchParams] = useSearchParams();
  const headerType = searchParams.get("t_header_type");
  // const cartsCount = useSelector((state: RootState) => state?.cartCount);
  const userToken = useSelector((state: RootState) => state?.user.token);
  const cartItems = useSelector((state: RootState) => state?.cartDate);
  const [products, setProducts] = useState<CartType[]>([]);
  const [checkedItems, setCheckedItem] = useState<number[]>();
  const [price, setPrice] = useState<PriceType | null>();
  const handleLoadData = async () => {
    // 리뷰 작성 가능한 데이터 (배송 완료)
    userCartData(userToken)
      .then((data) => {
        setProducts(data ?? []);
        const items = (data ?? []).filter(
          (product) => product?.objects?.soldOut === false
        );
        const selected = items.map((item) => item.object_seq);
        setCheckedItem(selected);
      })
      .catch((error) => {
        console.log(error);
      });

    // return;
  };
  useEffect(() => {
    if (headerType === "1") {
      handleLoadData();
    } else if (headerType === "2") {
      console.log("안녕", locatiton);
    } else if (headerType === "3") {
      console.log("3안녕", locatiton);
    }
  }, [headerType, userToken, cartItems]);

  //장바구니 제품 삭제
  const handleDelete = async (seq: number[]) => {
    cartDataDelete(userToken, seq)
      .then((data) => {
        if (!data) {
          alert("제품 삭제가 되었습니다");
          handleCartItems(userToken, dispatch);
          return;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAllChecked = (event: boolean) => {
    if (event) {
      setCheckedItem(products.map((item) => item.object_seq ?? 0));
    } else {
      setCheckedItem([]);
    }
  };

  useEffect(() => {
    let totalCount = 0;
    let disCount = 0;
    products.map((item) => {
      checkedItems?.map((checkedItem) => {
        if (item.objects?.object_seq === checkedItem) {
          totalCount =
            totalCount +
            (item?.objects?.count ?? 0) * (item?.object_count ?? 0);
          disCount =
            disCount +
            (item?.objects?.saleItem?.one_more !== null
              ? handlePrice(null, item?.objects?.count) *
                  (item?.object_count ?? 0) -
                (calculatePrice(
                  item?.object_count ?? 0,
                  item?.objects?.saleItem?.one_more,
                  handlePrice(item?.objects?.saleItem, item?.objects?.count)
                ) ?? 0)
              : (item?.objects?.count ?? 0) *
                (item?.object_count ?? 0) *
                0.01 *
                ((handleSaleTF(item?.objects?.saleItem)
                  ? item?.objects?.saleItem?.discount_rate
                  : 0) ?? 0));
        }
      });
    });

    setPrice({
      totalCount: totalCount,
      disCount: disCount,
      totalPrice: totalCount - disCount,
    });
  }, [checkedItems]);

  // 수량변경
  const handleCountChange = async (
    event: SelectChangeEvent<unknown>,
    objects: CardImageType
  ) => {
    const selected = (event.target as HTMLSelectElement).value;

    const update = modifyCartItems({
      objects: objects,
      count: Number(selected),
      dispatch: dispatch,
    });

    if (await update) {
      alert("수량 변경이 완료 되었습니다");
      handleCartItems(userToken, dispatch);
    }
  };
  return (
    <section role="region" aria-label="장바구니">
      <div className="relative z-[2] h-[100px] bg-[url('/public/assets/images/icons/bg_sale_top.png')] bg-[position:50%_0] bg-no-repeat">
        <Center className="flex h-[100px] items-center justify-between">
          <div className="top-l flex items-center gap-[17px] pt-0">
            <span className="text-black">
              {headerType === "1"
                ? "장바구니"
                : headerType === "2"
                ? "주문/결제"
                : "주문완료"}
            </span>
            {headerType === "1" && (
              <em className="block h-[45px] w-[45px] rounded-full bg-red-600 text-center text-[28px] font-bold leading-[47px] text-white">
                {cartItems?.length}
              </em>
            )}
          </div>

          <div className="top-r pt-0">
            <span
              className={cn(
                "text-xl font-normal text-[#8b8176]",
                headerType === "1" && "text-black"
              )}
            >
              <span className="inline-flex items-center gap-0.5">
                01 장바구니
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </span>
            </span>
            <span
              className={cn(
                "text-xl font-normal text-[#8b8176]",
                headerType === "2" && "text-black"
              )}
            >
              <span className="inline-flex items-center gap-0.5">
                02 주문/결제
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </span>
            </span>
            <span
              className={cn(
                "text-xl font-normal text-[#8b8176]",
                headerType === "3" && "text-black"
              )}
            >
              03 주문완료
            </span>
          </div>
        </Center>
      </div>
      <Center>
        {headerType === "1" && (
          <div className="relative z-[9] -mt-5 rounded-[5px] bg-white p-5">
            <div className="title-box flex items-center justify-between border-t-2 border-black py-[15px]">
              <h2>올리브샵 배송상품</h2>
              {cartItems?.length > 0 && (
                <div className={buttonBoxClasses}>
                  <button
                    className="gray_btn mr-2.5 border border-[#aaa] text-[#666]"
                    onClick={(event) => {
                      event.preventDefault();
                      if (checkedItems?.length === 0) {
                        alert("삭제할 제품을 선택해주세요");
                        return;
                      }
                      handleDelete(checkedItems ?? []);
                    }}
                  >
                    선택상품 삭제
                  </button>
                  <button
                    className="delete_btn gray_btn border border-[#aaa] text-[#666]"
                    onClick={(event) => {
                      event.preventDefault();
                      const items = products.filter(
                        (product) => product.objects?.soldOut
                      );
                      const selected = items.map(
                        (item) => item.object_seq ?? 0
                      );

                      if (selected?.length === 0) {
                        alert("품절된 제품이 없습니다");
                        return;
                      }
                      handleDelete(selected || []);
                    }}
                  >
                    품절상품 삭제
                  </button>
                </div>
              )}
            </div>
            <TableWrapper
              className={cn(
                "[&_tbody_tr.soldOut_.buy_btn]:border [&_tbody_tr.soldOut_.buy_btn]:border-[#aaa] [&_tbody_tr.soldOut_.buy_btn]:bg-[#dedede] [&_tbody_tr.soldOut_.buy_btn]:text-[#666]"
              )}
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "40px" }}>
                      <label htmlFor="">
                        <input
                          type="checkbox"
                          placeholder="아이디 저장"
                          onChange={(event) => {
                            handleAllChecked(event.target.checked);
                          }}
                          checked={
                            cartItems?.length > 0 &&
                            checkedItems?.length ===
                              (products ?? []).filter(
                                (product) => product.objects?.soldOut === false
                              )?.length
                          }
                        />
                      </label>
                    </th>
                    <th scope="col" style={{ width: "390px" }}>
                      상품정보
                    </th>
                    <th scope="col" style={{ width: "110px" }}>
                      판매자
                    </th>
                    <th scope="col" style={{ width: "80px" }}>
                      수량
                    </th>
                    <th scope="col" style={{ width: "110px" }}>
                      구매가
                    </th>
                    <th scope="col" style={{ width: "110px" }}>
                      배송정보
                    </th>
                    <th scope="col" style={{ width: "130px" }}>
                      선택
                    </th>
                  </tr>
                </thead>

                {products && products.length > 0 ? (
                  <tbody>
                    {products?.map((product, index) => (
                      <tr
                        key={index}
                        className={product?.objects?.soldOut ? "soldOut" : ""}
                      >
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            placeholder="아이디 저장"
                            disabled={product?.objects?.soldOut}
                            checked={
                              product?.objects?.soldOut
                                ? false
                                : checkedItems?.includes(
                                    product?.object_seq || 0
                                  )
                            }
                            onChange={() => {
                              setCheckedItem((prev) =>
                                (prev ?? []).includes(product?.object_seq ?? 0)
                                  ? (prev ?? []).filter(
                                      (item) =>
                                        item !== (product?.object_seq ?? 0)
                                    )
                                  : [...(prev ?? []), product?.object_seq ?? 0]
                              );
                            }}
                          />
                        </td>
                        <td
                          className={cn(
                            "border-r border-[#ccc] p-[30px]",
                            product?.objects?.soldOut && ""
                          )}
                        >
                          <div
                            className={informationClasses}
                            onClick={(event) => {
                              event.preventDefault();
                              navigate(
                                `/store/goods-detail?getGoods=${product?.object_seq}`
                              );
                            }}
                          >
                            <div className="img-wrapper">
                              <img src={product.img} alt="productImg" />
                              {product?.objects?.soldOut && <span>품절</span>}
                            </div>
                            <div className="infor-wrapper">
                              {moment().isBetween(
                                product?.objects?.saleItem?.start_sale_date,
                                product?.objects?.saleItem?.end_sale_date
                              ) && (
                                <em>
                                  {moment(
                                    product?.objects?.saleItem?.start_sale_date
                                  ).format("MM/DD")}
                                  ~
                                  {moment(
                                    product?.objects?.saleItem?.end_sale_date
                                  ).format("MM/DD")}
                                  까지
                                </em>
                              )}

                              <span>{product?.brand}</span>

                              <p>{product?.name}</p>
                              <div className="!justify-normal gap-px flex flex-row">
                                {product?.sale && (
                                  <span className={cn(tagClasses, "bg-sale")}>
                                    세일
                                  </span>
                                )}
                                {product?.coupon && (
                                  <span className={cn(tagClasses, "bg-coupon")}>
                                    쿠폰
                                  </span>
                                )}
                                {product?.objects?.saleItem?.one_more && (
                                  <span className={cn(tagClasses, "bg-one-more")}>
                                    {product?.objects?.saleItem?.one_more}+1
                                  </span>
                                )}
                                {moment().isBetween(
                                  product?.objects?.saleItem
                                    ?.start_today_sale_date,
                                  product?.objects?.saleItem
                                    ?.end_today_sale_date
                                ) && (
                                  <span className={cn(tagClasses, "bg-today-sale")}>
                                    오특
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="count border-r border-[#ccc] text-center font-medium text-[#222]">
                          {product?.objects?.count?.toLocaleString()}원
                        </td>
                        <td className="count border-r border-[#ccc] text-center font-medium text-[#222]">
                          <FormControl sx={{ m: 1, minWidth: 50 }} size="small">
                            <Select
                              sx={{ height: 30 }}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={product?.object_count}
                              onChange={(event) => {
                                if (!product?.objects?.object_seq) return;
                                handleCountChange(event, product?.objects);
                              }}
                              disabled={product?.objects?.soldOut}
                            >
                              <MenuItem value={1}>1</MenuItem>
                              <MenuItem value={2}>2</MenuItem>
                              <MenuItem value={3}>3</MenuItem>
                              <MenuItem value={4}>4</MenuItem>
                              <MenuItem value={5}>5</MenuItem>
                              <MenuItem value={6}>6</MenuItem>
                              <MenuItem value={7}>7</MenuItem>
                              <MenuItem value={8}>8</MenuItem>
                              <MenuItem value={9}>9</MenuItem>
                              <MenuItem value={10}>10</MenuItem>
                            </Select>
                          </FormControl>
                        </td>
                        <td className="discount border-r border-[#ccc] text-center [&_em]:block [&_em]:text-xs [&_em]:text-[#b5b5b5] [&_em]:line-through [&_p]:mt-[3px] [&_p]:block [&_p]:font-medium [&_p]:text-text-red">
                          {product?.objects?.saleItem?.one_more !== null ? (
                            <>
                              <em>
                                {(
                                  handlePrice(null, product?.objects?.count) *
                                  (product?.object_count ?? 0)
                                )?.toLocaleString()}
                                원
                              </em>
                              <p>
                                {calculatePrice(
                                  product?.object_count ?? 0,
                                  product?.objects?.saleItem?.one_more,
                                  handlePrice(
                                    product?.objects?.saleItem,
                                    product?.objects?.count
                                  )
                                )?.toLocaleString()}
                                원
                              </p>
                            </>
                          ) : handleSaleTF(product?.objects?.saleItem) ? (
                            <>
                              <em>
                                {calculatePrice(
                                  product?.object_count ?? 0,
                                  product?.objects?.saleItem?.one_more,
                                  handlePrice(null, product?.objects?.count)
                                )?.toLocaleString()}
                                원
                              </em>
                              <p>
                                {calculatePrice(
                                  product?.object_count ?? 0,
                                  product?.objects?.saleItem?.one_more,
                                  handlePrice(
                                    product?.objects?.saleItem,
                                    product?.objects?.count
                                  )
                                )?.toLocaleString()}
                                원
                              </p>
                            </>
                          ) : (
                            calculatePrice(
                              product?.object_count ?? 0,
                              product?.objects?.saleItem?.one_more,
                              handlePrice(null, product?.objects?.count)
                            )?.toLocaleString() + "원"
                          )}
                        </td>
                        <td className="delivery border-r border-[#ccc] text-center text-sm font-extrabold text-[#333]">
                          {
                            <>
                              {(calculatePrice(
                                product?.object_count ?? 0,
                                product?.objects?.saleItem?.one_more,
                                handlePrice(
                                  product?.objects?.saleItem,
                                  product?.objects?.count
                                )
                              ) ?? 0) >= 20000
                                ? "무료 배송"
                                : "2,500원"}
                              <p className="mt-[3px] text-xs font-normal text-[#666]">
                                도서산간 제외
                              </p>
                            </>
                          }
                        </td>
                        <td>
                          <div className={buttonBoxClasses}>
                            <button
                              className="buy_btn mb-1.5 border border-olive-green bg-white text-olive-green"
                              onClick={(event) => {
                                event.preventDefault();
                                if (product?.objects?.soldOut) {
                                  alert("품절된 상품입니다");
                                  return;
                                }

                                navigate(
                                  "/store/mypage/user-cart?t_header_type=2",
                                  {
                                    state: {
                                      products: [product],
                                      searchParams: { t_header_type: "2" },
                                      price: {
                                        totalCount:
                                          (product?.objects?.count ?? 0) *
                                          (product?.object_count ?? 0),
                                        disCount:
                                          product?.objects?.saleItem
                                            ?.one_more !== null
                                            ? handlePrice(
                                                null,
                                                product?.objects?.count
                                              ) *
                                                (product?.object_count ?? 0) -
                                              (calculatePrice(
                                                product?.object_count ?? 0,
                                                product?.objects?.saleItem
                                                  ?.one_more,
                                                handlePrice(
                                                  product?.objects?.saleItem,
                                                  product?.objects?.count
                                                )
                                              ) ?? 0)
                                            : (product?.objects?.count ?? 0) *
                                              (product?.object_count ?? 0) *
                                              0.01 *
                                              ((handleSaleTF(
                                                product?.objects?.saleItem
                                              )
                                                ? product?.objects?.saleItem
                                                    ?.discount_rate
                                                : 0) ?? 0),
                                        totalPrice:
                                          (product?.objects?.count ?? 0) *
                                            (product?.object_count ?? 0) -
                                          (product?.objects?.saleItem
                                            ?.one_more !== null
                                            ? handlePrice(
                                                null,
                                                product?.objects?.count
                                              ) *
                                                (product?.object_count ?? 0) -
                                              (calculatePrice(
                                                product?.object_count ?? 0,
                                                product?.objects?.saleItem
                                                  ?.one_more,
                                                handlePrice(
                                                  product?.objects?.saleItem,
                                                  product?.objects?.count
                                                )
                                              ) ?? 0)
                                            : (product?.objects?.count ?? 0) *
                                              (product?.object_count ?? 0) *
                                              0.01 *
                                              ((handleSaleTF(
                                                product?.objects?.saleItem
                                              )
                                                ? product?.objects?.saleItem
                                                    ?.discount_rate
                                                : 0) ?? 0)),
                                      },
                                    },
                                  }
                                );
                              }}
                            >
                              바로구매
                            </button>
                            <button
                              className="delete_btn gray_btn border border-[#aaa] text-[#666]"
                              onClick={(event) => {
                                event.preventDefault();
                                handleDelete([product?.object_seq || 0]);
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={7}>
                        <EmptyComponent
                          mainText=""
                          subText="바구니에 <br/>저장된 상품이 없습니다"
                        />
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </TableWrapper>

            {cartItems?.length > 0 && (
              <>
                <div className="mt-[50px] grid w-full grid-cols-3 border-y-2 border-[#ccc] [&>div]:relative [&>div]:flex [&>div]:h-[110px] [&>div]:flex-col [&>div]:items-center [&>div]:justify-center [&>div]:gap-[5px] [&>div]:border-r [&>div]:border-[#ededed] [&>div:nth-child(3)]:border-r-0 [&>div:nth-child(4)]:border-r-0 [&>div_p]:text-base [&>div_p]:text-[#666] [&>div_span]:text-2xl [&>div_span]:text-[#333] [&>div_em]:absolute [&>div_em]:-right-5 [&>div_em]:top-1/2 [&>div_em]:flex [&>div_em]:h-10 [&>div_em]:w-10 [&>div_em]:-translate-y-1/2 [&>div_em]:items-center [&>div_em]:justify-center [&>div_em]:rounded-full [&>div_em]:border [&>div_em]:border-[#ccc] [&>div_em]:bg-white [&>div_em]:text-[44px] [&>div_em]:text-[#333]">
                  <div className="total">
                    <p>총 판매가</p>
                    <span>{(price?.totalCount ?? 0).toLocaleString()}원</span>
                    <em>
                      <Minus className="h-6 w-6" aria-hidden />
                    </em>
                  </div>
                  <div className="discount [&_span]:text-star">
                    <p>총 할인금액</p>
                    <span>{(price?.disCount ?? 0).toLocaleString()}원</span>
                    <em>
                      <Plus className="h-6 w-6" aria-hidden />
                    </em>
                  </div>
                  <div className="delivery">
                    <p>총 배송비</p>
                    <span>
                      {(price?.totalPrice ?? 0) < 20000 ? "2,500" : "0"}원
                    </span>
                  </div>
                  <div className="totalPrice col-span-3 flex-row justify-end border-t border-[#ededed] bg-[#f6f6f6] px-[50px] [&_p]:text-[26px] [&_p]:text-black [&_span]:ml-5 [&_span]:text-star">
                    <p>총 결제예상금액</p>
                    <span>
                      {(
                        (price?.totalPrice ?? 0) +
                        ((price?.totalPrice ?? 0) >= 20000 ? 0 : 2500)
                      ).toLocaleString()}
                      원
                    </span>
                  </div>
                </div>
                <div className="mx-auto my-10 text-center [&_button]:h-[50px] [&_button]:w-[180px] [&_button]:rounded-[5px] [&_button]:border [&_button]:border-star [&_button]:px-0 [&_button]:py-[11px] [&_button]:text-base [&_button]:font-bold [&_button]:leading-7 [&_button]:text-star [&_.all-payment]:bg-star [&_.all-payment]:text-white">
                  <button
                    className="mr-2.5"
                    onClick={(event) => {
                      event.preventDefault();
                      const selectedProduct = products?.filter((product) =>
                        checkedItems?.includes(
                          product?.objects?.object_seq ?? 0
                        )
                      );

                      navigate("/store/mypage/user-cart?t_header_type=2", {
                        state: {
                          products: selectedProduct,
                          searchParams: { t_header_type: "2" },
                        },
                      });
                    }}
                  >
                    선택주문 ({checkedItems?.length})
                  </button>
                  <button
                    className="all-payment"
                    onClick={(event) => {
                      event.preventDefault();

                      console.log(products);
                      navigate("/store/mypage/user-cart?t_header_type=2", {
                        state: {
                          products: products.filter(
                            (product) => product?.objects?.soldOut === false
                          ),
                          searchParams: { t_header_type: "2" },
                        },
                      });
                    }}
                  >
                    전체주문
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/*  주문 결제 */}
        {headerType === "2" && <StoreUserPayment priceData={price} />}

        {/* 주문완료 */}
        {headerType === "3" && <StoreUserOrder />}
      </Center>
    </section>
  );
};

export default StoreUserCart;
