import React, { useEffect, useState } from "react";
import {
  Center,
  MainTitle,
  TableStyle,
  Tags,
} from "../../../public/assets/style";
import styled from "styled-components";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "redex/store";
import type { CardImageType, CartType } from "compontents/card/card.type";
import moment from "moment";
import {
  calculatePrice,
  handleCartItems,
  handlePrice,
  handleSaleTF,
} from "../../bin/common";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import StoreUserPayment from "./store-user-cart-payment";
import StoreUserOrder from "./store-user-order";
import { modifyCartItems } from "./addItemCart";
import EmptyComponent from "../../compontents/EmptyComponent";
import { cartDataDelete, userCartData } from "../../api/axios-index";
export interface PriceType {
  [key: string]: number;
}
const StoreUserCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const locatiton = useLocation();
  const today = new Date().toISOString().split("T")[0];
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
      setCheckedItem(products.map((item) => item.object_seq));
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
    <div>
      <MainLine>
        <Center>
          <div className="top-l">
            <span>
              {headerType === "1"
                ? "장바구니"
                : headerType === "2"
                ? "주문/결제"
                : "주문완료"}
            </span>
            {headerType === "1" && <em>{cartItems?.length}</em>}
          </div>

          <div className="top-r">
            <span className={headerType === "1" ? "on" : ""}>
              01 장바구니 &gt;
            </span>
            <span className={headerType === "2" ? "on" : ""}>
              02 주문/결제 &gt;
            </span>
            <span className={headerType === "3" ? "on" : ""}>03 주문완료</span>
          </div>
        </Center>
      </MainLine>
      <Center>
        {/* 장바구니 */}
        {headerType === "1" && (
          <Container>
            <div className="title-box">
              <h2>올리브샵 배송상품</h2>
              {cartItems?.length > 0 && (
                <ButtonBox>
                  <button
                    className="gray_btn"
                    style={{ marginRight: "10px" }}
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
                    className="delete_btn gray_btn"
                    onClick={(event) => {
                      event.preventDefault();
                      const items = products.filter(
                        (product) => product.objects?.soldOut
                      );
                      const selected = items.map((item) => item.object_seq);

                      if (selected?.length === 0) {
                        alert("품절된 제품이 없습니다");
                        return;
                      }
                      handleDelete(selected ?? []);
                    }}
                  >
                    품절상품 삭제
                  </button>
                </ButtonBox>
              )}
            </div>
            <ProductBox>
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
                                : checkedItems?.includes(product?.object_seq)
                            }
                            onChange={(event) => {
                              setCheckedItem((prev) =>
                                (prev ?? []).includes(product?.object_seq)
                                  ? (prev ?? []).filter(
                                      (item) => item !== product?.object_seq
                                    )
                                  : [...(prev ?? []), product?.object_seq]
                              );
                            }}
                          />
                        </td>
                        <TableBody style={{ padding: "30px" }}>
                          <Information
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
                              <Tags>
                                {product?.sale && (
                                  <span className="sale">세일</span>
                                )}
                                {product?.coupon && (
                                  <span className="coupon">쿠폰</span>
                                )}
                                {product?.objects?.saleItem?.one_more && (
                                  <span className="oneMore">
                                    {product?.objects?.saleItem?.one_more}+1
                                  </span>
                                )}
                                {today ===
                                  product?.objects?.saleItem
                                    ?.today_sale_date && (
                                  <span className="today_sale">오특</span>
                                )}
                              </Tags>
                            </div>
                          </Information>
                        </TableBody>
                        <TableBody className="count">
                          {product?.objects?.count?.toLocaleString()}원
                        </TableBody>
                        <TableBody className="count">
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
                        </TableBody>
                        <TableBody className="discount">
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
                        </TableBody>
                        <TableBody className="delivery">
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
                              <p>도서산간 제외</p>
                            </>
                          }
                        </TableBody>
                        <td>
                          <ButtonBox>
                            <button
                              className="buy_btn"
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
                              className="delete_btn gray_btn"
                              onClick={(event) => {
                                event.preventDefault();
                                handleDelete([product.object_seq]);
                              }}
                            >
                              삭제
                            </button>
                          </ButtonBox>
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
            </ProductBox>

            {cartItems?.length > 0 && (
              <>
                <TotalPriceInfo>
                  <div className="total">
                    <p>총 판매가</p>
                    <span>{(price?.totalCount ?? 0).toLocaleString()}원</span>
                    <em>-</em>
                  </div>
                  <div className="discount">
                    <p>총 할인금액</p>
                    <span>{(price?.disCount ?? 0).toLocaleString()}원</span>
                    <em>+</em>
                  </div>
                  <div className="delivery">
                    <p>총 배송비</p>
                    <span>
                      {(price?.totalPrice ?? 0) < 20000 ? "2,500" : "0"}원
                    </span>
                  </div>
                  <div className="totalPrice">
                    <p>총 결제예상금액</p>
                    <span>
                      {(
                        (price?.totalPrice ?? 0) +
                        ((price?.totalPrice ?? 0) >= 20000 ? 0 : 2500)
                      ).toLocaleString()}
                      원
                    </span>
                  </div>
                </TotalPriceInfo>
                <PaymentBox>
                  <button
                    className=""
                    style={{ marginRight: "10px" }}
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
                </PaymentBox>
              </>
            )}
          </Container>
        )}

        {/*  주문 결제 */}
        {headerType === "2" && <StoreUserPayment priceData={price} />}

        {/* 주문완료 */}
        {headerType === "3" && <StoreUserOrder />}
      </Center>
    </div>
  );
};

export default StoreUserCart;
const PaymentBox = styled.div`
  margin: 40px auto;
  text-align: center;
  button {
    height: 50px;
    font-size: 16px;
    width: 180px;
    background-color: #fff;
    background-color: #fff;
    border: 1px solid #f27370;
    padding: 11px 0 9px;
    font-size: 16px;
    line-height: 28px;
    color: #f27370;
    border-radius: 5px;
    font-weight: 700;
  }

  .all-payment {
    color: #fff;
    background-color: #f27370;
  }
`;
const TotalPriceInfo = styled.div`
  display: grid;
  margin-top: 50px;
  width: 100%;
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
  grid-template-columns: repeat(3, 1fr);
  > div {
    height: 110px;
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    justify-content: center;
    row-gap: 5px;
    border-right: 1px solid #ededed;
    &:nth-child(3),
    &:nth-child(4) {
      border-right: none;
    }
    p {
      font-size: 16px;
      color: #666;
    }
    span {
      color: #333;
      font-size: 24px;
    }
    em {
      color: #333;
      display: block;
      width: 40px;
      height: 40px;
      text-align: center;
      line-height: 46px;
      border-radius: 50%;
      position: absolute;
      right: -20px;
      top: 50%;
      transform: translateY(-50%);
      background: #fff;
      border: 1px solid #ccc;
      font-size: 44px;
    }
    &.discount {
      span {
        color: #f27370;
      }
    }
  }

  .totalPrice {
    border-top: 1px solid #ededed;
    background-color: #f6f6f6;
    grid-column: 1 / 4;
    flex-direction: row;
    padding: 0 50px;
    justify-content: flex-end;
    p {
      font-size: 26px;
      color: #000;
    }
    span {
      margin-left: 20px;
      color: #f27370;
    }
  }
`;
const ButtonBox = styled.div`
  text-align: center;
  button {
    height: 28px;
    padding: 0 5px;
    font-size: 12px !important;
    line-height: 28px;
    border-radius: 5px;
    width: 95px;
    &.buy_btn {
      border: 1px solid #9bce26;
      color: #9bce26;
      background: #fff;
      margin-bottom: 6px;
    }

    &.gray_btn {
      border: 1px solid #aaa;
      color: #666;
    }
  }
`;
const TableBody = styled.td`
  border-right: 1px solid #ccc;
  &.count {
    text-align: center;
    /* display: block; */
    color: #222;
    font-weight: 500;
  }

  &.discount {
    text-align: center;
    /* display: block; */
    /* color: #222; */
    /* font-weight: 500; */
    em {
      display: block;
      font-size: 12px;
      color: #b5b5b5;
      text-decoration: line-through;
    }
    p {
      display: block;
      color: #e02020;
      font-weight: 500;
      margin-top: 3px;
    }
  }

  &.delivery {
    text-align: center;
    color: #333;
    font-size: 14px;
    font-weight: 800;
    p {
      color: #666;
      font-size: 12px;
      font-weight: 400;
      margin-top: 3px;
    }
  }
`;
const Information = styled.div`
  column-gap: 20px;
  display: flex;
  align-items: center;
  .img-wrapper {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    width: 85px;
    height: 85px;
    img {
      width: 85px;
      height: 85px;
    }
    span {
      position: absolute;
      width: 100%;
      line-height: 22px;
      height: 22px;
      font-size: 12px;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      bottom: 0;
      left: 0;
      text-align: center;
      right: 0;
    }
  }
  > div.infor-wrapper {
    max-width: 228px;
    /* display: flex;
    flex-direction: column;
    row-gap: 5px; */
    > span,
    em {
      display: block;
      margin-bottom: 4px;
      color: #777;
      font-weight: 700;
    }
    p {
      overflow: hidden;
      max-height: 36px;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      word-break: normal;
      font-size: 14px;
      line-height: 18px;
      margin-bottom: 5px;
      color: #000;
    }
    em {
      font-size: 12px;
    }
  }
`;

const ProductBox = styled(TableStyle)`
  tbody {
    tr.soldOut {
      .buy_btn {
        border: 1px solid #aaa;
        color: #666;
        background-color: #dedede;
      }
    }
  }
`;

const MainLine = styled(MainTitle)`
  height: 100px;
  background: url("/public/assets/images/icons/bg_sale_top.png") 50% 0 no-repeat;

  > div {
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    > div.top-l {
      padding-top: 0px;
      align-items: center;
      span {
        color: #000;
      }

      em {
        display: block;
        width: 45px;
        height: 45px;
        line-height: 47px;
        text-align: center;
        background: red;
        color: #fff;
        border-radius: 50%;
        font-size: 28px;
        font-weight: bold;
      }
    }

    > div.top-r {
      padding-top: 0px;
      span {
        color: #8b8176;
        font-size: 20px;
        font-weight: 400;
        &.on {
          color: #000;
        }
      }
    }
  }
`;
const Container = styled.div`
  padding: 20px;
  margin-top: -20px;
  background-color: #fff;
  z-index: 9;
  position: relative;
  border-radius: 5px;
  div.title-box {
    border-top: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    .gray_btn {
      width: 90px;
    }
  }
`;
