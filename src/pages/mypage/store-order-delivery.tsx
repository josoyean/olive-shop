import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import styled from "styled-components";
import { calculatePrice, handlePrice, handleSaleTF } from "../../bin/common";
import type { RootState } from "../../redex/store";
import { useDispatch, useSelector } from "react-redux";
interface OrderDataType {
  [key: string]: OrderType[];
}
import { supabase } from "../../supabase";
import {
  BlueButton,
  TableStyle,
  WhiteButton,
} from "../../../public/assets/style";
import { Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {
  StringType,
  type CardImageType,
  type CartType,
  type OrderType,
} from "compontents/card/card.type";
import { useNavigate } from "react-router-dom";
import { addItemCart } from "../../pages/carts/addItemCart";
import EmptyComponent from "../../compontents/EmptyComponent";
import { orderDeliveryData, paymentOrderCancel } from "../../api/axios-index";

const StoreOrderDelivery = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userToken = useSelector((state: RootState) => state?.user.token);
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<OrderDataType>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });

  const [paymentData, setPaymentData] = useState<OrderType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [startDate, setStartDate] = useState<StringType>({
    year: moment.utc().subtract(1, "months").format("YYYY"),
    month: moment.utc().subtract(1, "months").format("MM"),
    day: moment.utc().subtract(1, "months").format("DD"),
    dayCount: "0",
  });
  const [endDate, setEndDate] = useState<StringType>({
    year: moment.utc().format("YYYY"),
    month: moment.utc().format("MM"),
    day: moment.utc().format("DD"),
    dayCount: "0",
  });
  const handleDataLoad = useCallback(async () => {
    orderDeliveryData(
      userToken,
      `${startDate.year}-${startDate.month}-${startDate.day}`,
      `${endDate.year}-${endDate.month}-${endDate.day}`
    )
      .then((data) => {
        if (!firstLoading && data?.length === 0) {
          alert("주문/배송 정보가 없습니다");
          return;
        }
        if (firstLoading) {
          setFirstLoading(false);
        }
        setPaymentData(data || []);
        console.log(data);
        const groupedData: OrderDataType = {};

        data?.forEach((item) => {
          const step = item.deliveryStep;
          if (item?.paymentCancel) return;
          if (!groupedData[step]) {
            groupedData[step] = [];
          }

          groupedData[step].push(item);
        });
        setOrderData(groupedData);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [userToken, selectedMonth]);
  useEffect(() => {
    handleDataLoad();
    handleDay(startDate?.year, startDate?.month, "start");
    handleDay(endDate?.year, endDate?.month, "end");
  }, []);

  const handleDay = (year: string, month: string, type: string) => {
    const startDay = moment(`${year}-${month}-01`).startOf("months");
    const endDay = moment(`${year}-${month}-01`).endOf("months");

    if (type === "start") {
      setStartDate((prevState) => ({
        ...prevState,
        dayCount: String(endDay.diff(startDay, "days") + 1),
      }));
    } else {
      setEndDate((prevState) => ({
        ...prevState,
        dayCount: String(endDay.diff(startDay, "days") + 1),
      }));
    }
  };

  const handleSelectedDate = (month: number) => {
    setSelectedMonth(month);
    const date = moment.utc().subtract(month, "months");
    setStartDate({
      year: date.format("YYYY"),
      month: date.format("MM"),
      day: date.format("DD"),
      dayCount: "0",
    });
    setEndDate({
      year: moment.utc().format("YYYY"),
      month: moment.utc().format("MM"),
      day: moment.utc().format("DD"),
      dayCount: "0",
    });

    handleDay(date.format("YYYY"), date.format("MM"), "start");
    handleDay(moment.utc().format("YYYY"), moment.utc().format("MM"), "end");
  };
  const handleOrderCancel = async (id: string) => {
    paymentOrderCancel(userToken, id)
      .then((data) => {
        if (!data) {
          handleDataLoad();
          alert("결제 취소가 완료 되었습니다");
          return;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleObjects = async (info: number[]): Promise<CardImageType[]> => {
    let query = supabase.from("objects").select("*,saleItem(*)");
    query = query.in("object_seq", info);
    const { data } = await query;

    return data || [];
  };
  const handleObjectCount = (
    objectItem: CartType[]
  ): { totalCount: number; disCount: number; totalPrice: number } => {
    let totalCount = 0;
    let disCount = 0;
    objectItem.forEach((item) => {
      totalCount =
        totalCount + (item?.objects?.count ?? 0) * (item?.object_count ?? 0);
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
    });

    return { totalCount, disCount, totalPrice: totalCount - disCount };
  };
  const handleDeliveryStep = (step: number, id: string): React.ReactNode => {
    switch (step) {
      case 1:
        return (
          <div>
            <em>주문접수</em>
            <BlueButton
              onClick={() => {
                const confirm = window.confirm("정말로 결제 취소 하겠습니까?");
                if (confirm) {
                  handleOrderCancel(id);
                  console.log(id);
                }
              }}
              width="70px"
              height="27px"
            >
              결제 취소
            </BlueButton>
          </div>
        );
        break;
      case 2:
        return (
          <div>
            <em>결제완료</em>
            <BlueButton
              width="70px"
              height="27px"
              onClick={() => {
                const confirm = window.confirm("정말로 결제 취소 하겠습니까?");
                if (confirm) {
                  handleOrderCancel(id);
                }
              }}
            >
              결제 취소
            </BlueButton>
          </div>
        );
        break;
      case 3:
        return (
          <div>
            <em>배송준비중</em>
            <BlueButton
              onClick={() => {
                alert("준비중 입니다");
              }}
              width="70px"
              height="27px"
            >
              배송 조회
            </BlueButton>
          </div>
        );
        break;
      case 4:
        return (
          <div>
            <em>배송중</em>
            <BlueButton
              onClick={() => {
                alert("준비중 입니다");
              }}
              width="70px"
              height="27px"
            >
              리뷰 작성
            </BlueButton>
          </div>
        );
        break;
      case 5:
        return (
          <div>
            <em>배송완료</em>
            <BlueButton
              onClick={() => {
                alert("준비중 입니다");
              }}
              width="70px"
              height="27px"
            >
              리뷰 작성
            </BlueButton>
          </div>
        );
        break;
    }
  };

  return (
    <div>
      <OrderBox>
        <div className="text-box">
          <div>
            <h2>주문/배송 조회</h2>
          </div>
        </div>
        <ul className="order-box">
          <li>
            <em className={`${orderData[1]?.length > 0 && "on"}`}>
              {orderData[1]?.length || 0}
            </em>
            <span>주문접수</span>
          </li>
          <li>
            <em className={`${orderData[2]?.length > 0 && "on"}`}>
              {orderData[2]?.length || 0}
            </em>
            <span>결제완료</span>
          </li>
          <li>
            <em className={`${orderData[3]?.length > 0 && "on"}`}>
              {orderData[3]?.length || 0}
            </em>
            <span>배송준비중</span>
          </li>
          <li>
            <em className={`${orderData[4]?.length > 0 && "on"}`}>
              {orderData[4]?.length || 0}
            </em>
            <span>배송중</span>
          </li>
          <li>
            <em className={`${orderData[5]?.length > 0 && "on"}`}>
              {orderData[5]?.length || 0}
            </em>
            <span>배송완료</span>
          </li>
        </ul>
      </OrderBox>
      <SearchBox>
        <div>
          <em>구매기간</em>

          <Search>
            <ul>
              <li
                className={`${selectedMonth === 1 ? "on" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelectedDate(1);
                }}
              >
                1개월
              </li>
              <li
                className={`${selectedMonth === 3 ? "on" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelectedDate(3);
                }}
              >
                3개월
              </li>
              <li
                className={`${selectedMonth === 6 ? "on" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelectedDate(6);
                }}
              >
                6개월
              </li>
              <li
                className={`${selectedMonth === 12 ? "on" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelectedDate(12);
                }}
              >
                12개월
              </li>
            </ul>
            <DateContainer>
              <div>
                <div>
                  <FormControl sx={{ minWidth: 70 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={startDate?.year}
                      onChange={(event) => {
                        event.preventDefault();
                        setStartDate((prevState) => ({
                          ...prevState,
                          year: event.target.value,
                        }));
                        handleDay(
                          event?.target?.value ?? "",
                          startDate?.month ?? "",
                          "start"
                        );
                        setSelectedMonth(0);
                      }}
                    >
                      {Array.from({ length: 3 }).map((_, index) => (
                        <MenuItem
                          value={Number(moment.utc().format("YYYY")) - index}
                          style={{ height: "25px" }}
                          key={index}
                        >
                          {Number(moment.utc().format("YYYY")) - index}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <span className="label">년</span>
                </div>
                <div>
                  <FormControl sx={{ minWidth: 60 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={startDate?.month}
                      onChange={(event) => {
                        event.preventDefault();
                        setStartDate((prevState) => ({
                          ...prevState,
                          month: event.target.value,
                        }));
                        handleDay(
                          startDate?.year ?? "",
                          event.target.value,
                          "start"
                        );
                        setSelectedMonth(0);
                      }}
                    >
                      {Array.from({ length: 12 }).map((_, index) => (
                        <MenuItem
                          key={index}
                          value={String(index + 1).padStart(2, "0")}
                          style={{ height: "25px" }}
                        >
                          {index + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <span className="label">월</span>
                </div>
                <div>
                  <FormControl sx={{ minWidth: 60 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={startDate?.day}
                      onChange={(event) => {
                        event.preventDefault();
                        setStartDate((prevState) => ({
                          ...prevState,
                          day: event.target.value,
                        }));
                        setSelectedMonth(0);
                      }}
                    >
                      {Array.from({ length: Number(startDate?.dayCount) }).map(
                        (_, index) => (
                          <MenuItem
                            key={index}
                            value={String(index + 1).padStart(2, "0")}
                            style={{ height: "25px" }}
                          >
                            {index + 1}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <span className="label">일</span>
                </div>
              </div>
              <em>~</em>
              <div>
                <div>
                  <FormControl sx={{ minWidth: 70 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={endDate?.year}
                      onChange={(event) => {
                        event.preventDefault();

                        setEndDate((prevState) => ({
                          ...prevState,
                          year: event.target.value,
                        }));
                        handleDay(
                          event?.target?.value ?? "",
                          endDate?.month ?? "",
                          "end"
                        );
                        setSelectedMonth(0);
                      }}
                    >
                      {Array.from({ length: 3 }).map((_, index) => (
                        <MenuItem
                          value={Number(moment.utc().format("YYYY")) - index}
                          style={{ height: "25px" }}
                          key={index}
                        >
                          {Number(moment.utc().format("YYYY")) - index}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <span className="label">년</span>
                </div>
                <div>
                  <FormControl sx={{ minWidth: 60 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={endDate?.month}
                      onChange={(event) => {
                        event.preventDefault();
                        setEndDate((prevState) => ({
                          ...prevState,
                          month: event.target.value,
                        }));
                        handleDay(
                          endDate?.year ?? "",
                          event.target.value,
                          "end"
                        );
                        setSelectedMonth(0);
                      }}
                    >
                      {Array.from({ length: 12 }).map((_, index) => (
                        <MenuItem
                          key={index}
                          value={String(index + 1).padStart(2, "0")}
                          style={{ height: "25px" }}
                        >
                          {index + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <span className="label">월</span>
                </div>
                <div>
                  <FormControl sx={{ minWidth: 60 }} size="small">
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={endDate?.day}
                      onChange={(event) => {
                        event.preventDefault();
                        setEndDate((prevState) => ({
                          ...prevState,
                          day: event.target.value,
                        }));
                        setSelectedMonth(0);
                      }}
                    >
                      {Array.from({ length: Number(endDate?.dayCount) }).map(
                        (_, index) => (
                          <MenuItem
                            key={index}
                            value={String(index + 1).padStart(2, "0")}
                            style={{ height: "25px" }}
                          >
                            {index + 1}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <span className="label">일</span>
                </div>
              </div>
            </DateContainer>
          </Search>
        </div>
        <BlueButton
          width="100px"
          height="auto"
          style={{ fontSize: "14px", borderRadius: "0px" }}
          onClick={() => {
            handleDataLoad();
          }}
        >
          조회
        </BlueButton>
      </SearchBox>
      <Table>
        <table>
          <thead>
            <tr>
              <th scope="col" style={{ width: "180px" }}>
                주문일자
              </th>
              <th scope="col">상품</th>
              <th scope="col" style={{ width: "50px" }}>
                수량
              </th>
              <th scope="col" style={{ width: "100px" }}>
                주문금액
              </th>
              <th scope="col" style={{ width: "100px" }}>
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentData?.length > 0 ? (
              paymentData?.map((item, index) => (
                <React.Fragment key={index}>
                  {item.objectsInfo?.map((info, index) => (
                    <tr key={index}>
                      {index === 0 && (
                        <td
                          rowSpan={item.objectsInfo?.length}
                          className="orderId"
                        >
                          Y{item.orderId}
                        </td>
                      )}
                      <td
                        className="objectsInfo"
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(
                            `/store/goods-detail?getGoods=${info?.object_seq}`
                          );
                        }}
                      >
                        <div className="img-wrapper">
                          <img src={info.img} alt="상품이미지" />
                          {info.soldOut && <em>품절</em>}
                        </div>
                        <div className="info">
                          <p>{info.brand}</p>
                          <h5>{info.name}</h5>
                        </div>
                      </td>
                      <td className="objectCount">{info?.object_count}</td>
                      <td className="discount">
                        {(info?.sale_count ?? 0)?.toLocaleString()}원
                      </td>
                      {index === 0 && (
                        <td
                          rowSpan={item.objectsInfo?.length}
                          className="deliveryStep"
                        >
                          {item.paymentCancel ? (
                            <div>
                              <em>결제 취소 완료</em>
                              <WhiteButton
                                onClick={async () => {
                                  const info = await handleObjects(
                                    item.objectsInfo.map(
                                      (item) => item.object_seq
                                    )
                                  );

                                  info.map((infoItem) => {
                                    if (infoItem.soldOut) {
                                      alert("품절된 상품입니다");
                                      return;
                                    }
                                    const buyCount = item.objectsInfo.find(
                                      (item) =>
                                        item.object_seq === infoItem.object_seq
                                    )?.object_count;

                                    if (buyCount === undefined) return;
                                    addItemCart({
                                      objects: {
                                        ...infoItem,
                                        addCount: buyCount,
                                      },
                                      dispatch: dispatch,
                                    });
                                  });
                                }}
                                width="70px"
                                height="27px"
                              >
                                장바구니
                              </WhiteButton>
                              <BlueButton
                                onClick={async () => {
                                  const info = item.objectsInfo.map(
                                    (item) => item.object_seq
                                  );
                                  const objects = await handleObjects(info);
                                  if (objects?.every((item) => item.soldOut)) {
                                    alert("품절된 상품입니다");
                                    return;
                                  }
                                  let items = null;
                                  if (objects?.some((item) => item.soldOut)) {
                                    const confirm = window.confirm(
                                      "품절된 상품 제외한 상품만 구매를 할까요?"
                                    );
                                    if (confirm) {
                                      items = objects.filter(
                                        (item) => !item.soldOut
                                      );
                                    }
                                  } else {
                                    items = objects;
                                    const objectItem = items?.map((isItem) => {
                                      return {
                                        objects: isItem,
                                        object_count:
                                          item?.objectsInfo?.find(
                                            (info) =>
                                              info.object_seq ===
                                              isItem.object_seq
                                          )?.object_count || 0,
                                      };
                                    });

                                    navigate(
                                      "/store/mypage/user-cart?t_header_type=2",
                                      {
                                        state: {
                                          products: objectItem,
                                          searchParams: {
                                            t_header_type: "2",
                                          },
                                          price: handleObjectCount(objectItem),
                                        },
                                      }
                                    );
                                  }
                                }}
                                width="70px"
                                height="27px"
                              >
                                구매하기
                              </BlueButton>
                            </div>
                          ) : (
                            handleDeliveryStep(
                              item.deliveryStep ?? 0,
                              item.id ?? 0
                            )
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <EmptyComponent
                    mainText={"주문/배송 내역이 없습니다"}
                    subText=""
                  ></EmptyComponent>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>
    </div>
  );
};
const Table = styled(TableStyle)`
  tbody td {
    padding: 20px 8px;
  }
  tbody {
    td {
      border-right: 1px solid #ccc;
      &:last-child {
        border-right: none;
      }
    }
    td.orderId {
      color: #116dff;
      font-weight: 500;
      text-align: center;
      font-size: 13px;
    }
    td.objectsInfo {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
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

      .info {
        width: calc(100% - 95px);
        p {
          display: block;
          margin-bottom: 4px;
          color: #777;
          font-size: 14px;
          font-weight: 700;
        }
        h5 {
          overflow: hidden;
          max-height: 36px;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          word-break: normal;
          font-size: 13px;
          line-height: 18px;
          font-weight: normal;
          margin-bottom: 5px;
          color: #000;
        }
      }
    }
    td.objectCount {
      text-align: center;
    }
    td.discount {
      text-align: center;
      border-right: 1px solid #ccc !important;
      div {
        text-align: center;
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
    }
    td.deliveryStep {
      > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 5px;
        justify-content: center;
        button {
          font-size: 13px;
        }
        em {
          font-size: 12px;
        }
      }
    }
  }
`;
const DateContainer = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 15px;
  align-items: center;
  .MuiInputBase-root {
    height: 25px;
    font-size: 13px;
  }
  > div {
    display: flex;
    align-items: end;
    column-gap: 10px;
    > div {
      display: flex;
      align-items: flex-end;
      column-gap: 5px;
    }
    .label {
      color: #000;
      font-size: 13px;
    }
  }
`;
const Search = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 15px;
  width: calc(100% - 70px);
  ul {
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    li {
      padding: 0 15px;
      height: 28px;
      width: fit-content;
      text-align: center;
      line-height: 28px;
      color: #797979;
      font-size: 12px;
      border-radius: 3px;
      display: block;
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #797979;
      &.on {
        color: #fff;
        background-color: #797979;
      }
    }
  }
`;
const SearchBox = styled.div`
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  margin-top: 30px;
  margin-bottom: 30px;
  > div {
    background-color: #fafafa;
    width: calc(100% - 100px);
    padding: 20px;
    display: flex;
    align-items: baseline;
    > em {
      color: #888;
      display: block;
      width: 70px;
      font-size: 13px;
    }
  }
`;
const OrderBox = styled.div`
  margin-top: 60px;
  .text-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
      display: flex;
      align-items: baseline;
      column-gap: 10px;
    }
    span {
      font-size: 14px;
      cursor: pointer;
    }
  }
  li {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    em {
      color: #888;
      font-style: normal;
      font-size: 40px;
      font-weight: 500;
      &.on {
        color: ${({ theme }) => theme.color.main};
      }
    }
    span {
      color: #666;
      font-size: 16px;
    }
    &::after {
      display: block;
      content: ">";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 0;
      color: #888;
      font-size: 40px;
      font-weight: bold;
    }
    &:last-child::after {
      display: none;
    }
  }

  .order-box {
    overflow: hidden;
    width: 100%;
    margin-top: 20px;
    border-radius: 10px;
    background-color: #f5f5f5;
    height: 117px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }
  .review-box {
    overflow: hidden;
    width: 100%;
    margin-top: 20px;
    /* height: 117px; */
    display: grid;
    column-gap: 50px;
    grid-template-columns: repeat(2, 1fr);
    li {
      height: 117px;
      cursor: pointer;
      border-radius: 10px;
      flex-direction: row-reverse;
      column-gap: 10px;
      background-color: #f5f5f5;
      &::after {
        display: none;
      }
      em {
        color: ${({ theme }) => theme.color.main};
      }
    }
    li::after {
    }
  }
`;
export default StoreOrderDelivery;
