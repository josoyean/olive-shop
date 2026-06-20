import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { cn } from "@/lib/cn";
import { BlueButton, TableWrapper, WhiteButton } from "@/components/ui/FormElements";
import { calculatePrice, handlePrice, handleSaleTF } from "../../utils/common";
import type { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
interface OrderDataType {
  [key: string]: OrderType[];
}
import { supabase } from "../../supabase";
import { Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {
  StringType,
  type CardImageType,
  type CartType,
  type OrderType,
} from "components/card/card.type";
import { useNavigate } from "react-router-dom";
import { addItemCart } from "@/services/cart";
import EmptyComponent from "../../components/EmptyComponent";
import { orderDeliveryData, paymentOrderCancel } from "../../api/axios-index";

const orderBoxClasses = cn(
  "mt-[60px]",
  "[&_.text-box]:flex [&_.text-box]:items-center [&_.text-box]:justify-between",
  "[&_.text-box>div]:flex [&_.text-box>div]:items-baseline [&_.text-box>div]:gap-2.5",
  "[&_.text-box_span]:cursor-pointer [&_.text-box_span]:text-sm",
  "[&_.order-box]:mt-5 [&_.order-box]:grid [&_.order-box]:h-[117px] [&_.order-box]:w-full [&_.order-box]:grid-cols-5 [&_.order-box]:overflow-hidden [&_.order-box]:rounded-[10px] [&_.order-box]:bg-[#f5f5f5]",
  "[&_li]:relative [&_li]:flex [&_li]:flex-col [&_li]:items-center [&_li]:justify-center",
  "[&_li_em]:text-[40px] [&_li_em]:font-medium [&_li_em]:not-italic [&_li_em]:text-[#888]",
  "[&_li_em.on]:text-primary [&_li_span]:text-base [&_li_span]:text-[#666]",
  "[&_li]:after:absolute [&_li]:after:right-0 [&_li]:after:top-1/2 [&_li]:after:-translate-y-1/2 [&_li]:after:text-[40px] [&_li]:after:font-bold [&_li]:after:text-[#888] [&_li]:after:content-['>']",
  "[&_li:last-child]:after:hidden"
);

const searchClasses = cn(
  "flex w-[calc(100%-70px)] flex-col gap-[15px]",
  "[&_ul]:flex [&_ul]:flex-row [&_ul]:gap-[5px]",
  "[&_li]:block [&_li]:h-7 [&_li]:w-fit [&_li]:cursor-pointer [&_li]:rounded-[3px] [&_li]:border [&_li]:border-[#797979] [&_li]:bg-white [&_li]:px-[15px] [&_li]:text-center [&_li]:text-xs [&_li]:leading-7 [&_li]:text-[#797979]",
  "[&_li.on]:border-[#797979] [&_li.on]:bg-[#797979] [&_li.on]:text-white"
);

const dateContainerClasses = cn(
  "flex flex-row items-center gap-[15px]",
  "[&_.MuiInputBase-root]:h-[25px] [&_.MuiInputBase-root]:text-[13px]",
  "[&>div]:flex [&>div]:items-end [&>div]:gap-2.5",
  "[&>div>div]:flex [&>div>div]:items-end [&>div>div]:gap-[5px]",
  "[&_.label]:text-[13px] [&_.label]:text-black"
);

const tableClasses = cn(
  "[&_tbody_td]:border-r [&_tbody_td]:border-[#ccc] [&_tbody_td]:p-5 [&_tbody_td:last-child]:border-r-0",
  "[&_.orderId]:text-center [&_.orderId]:text-[13px] [&_.orderId]:font-medium [&_.orderId]:text-primary",
  "[&_.objectsInfo]:flex [&_.objectsInfo]:cursor-pointer [&_.objectsInfo]:items-center [&_.objectsInfo]:justify-between",
  "[&_.img-wrapper]:relative [&_.img-wrapper]:h-[85px] [&_.img-wrapper]:w-[85px] [&_.img-wrapper]:overflow-hidden [&_.img-wrapper]:rounded-[10px]",
  "[&_.img-wrapper_img]:h-[85px] [&_.img-wrapper_img]:w-[85px]",
  "[&_.img-wrapper_span]:absolute [&_.img-wrapper_span]:bottom-0 [&_.img-wrapper_span]:left-0 [&_.img-wrapper_span]:right-0 [&_.img-wrapper_span]:h-[22px] [&_.img-wrapper_span]:bg-black/50 [&_.img-wrapper_span]:text-center [&_.img-wrapper_span]:text-xs [&_.img-wrapper_span]:leading-[22px] [&_.img-wrapper_span]:text-white",
  "[&_.info]:w-[calc(100%-95px)] [&_.info_p]:mb-1 [&_.info_p]:block [&_.info_p]:text-sm [&_.info_p]:font-bold [&_.info_p]:text-[#777]",
  "[&_.info_h5]:mb-[5px] [&_.info_h5]:line-clamp-2 [&_.info_h5]:max-h-9 [&_.info_h5]:overflow-hidden [&_.info_h5]:text-[13px] [&_.info_h5]:font-normal [&_.info_h5]:leading-[18px] [&_.info_h5]:text-black",
  "[&_.objectCount]:text-center [&_.discount]:border-r [&_.discount]:border-[#ccc] [&_.discount]:text-center",
  "[&_.deliveryStep>div]:flex [&_.deliveryStep>div]:flex-col [&_.deliveryStep>div]:items-center [&_.deliveryStep>div]:justify-center [&_.deliveryStep>div]:gap-[5px]",
  "[&_.deliveryStep_button]:text-[13px] [&_.deliveryStep_em]:text-xs"
);

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
    <section role="region" aria-label="주문/배송 조회">
      <div className={orderBoxClasses}>
        <div className="text-box">
          <div>
            <h2>주문/배송 조회</h2>
          </div>
        </div>
        <ul className="order-box" role="list" aria-label="배송 상태">
          <li role="listitem">
            <em className={`${orderData[1]?.length > 0 && "on"}`}>
              {orderData[1]?.length || 0}
            </em>
            <span>주문접수</span>
          </li>
          <li role="listitem">
            <em className={`${orderData[2]?.length > 0 && "on"}`}>
              {orderData[2]?.length || 0}
            </em>
            <span>결제완료</span>
          </li>
          <li role="listitem">
            <em className={`${orderData[3]?.length > 0 && "on"}`}>
              {orderData[3]?.length || 0}
            </em>
            <span>배송준비중</span>
          </li>
          <li role="listitem">
            <em className={`${orderData[4]?.length > 0 && "on"}`}>
              {orderData[4]?.length || 0}
            </em>
            <span>배송중</span>
          </li>
          <li role="listitem">
            <em className={`${orderData[5]?.length > 0 && "on"}`}>
              {orderData[5]?.length || 0}
            </em>
            <span>배송완료</span>
          </li>
        </ul>
      </div>
      <div className="mt-[30px] mb-[30px] flex w-full overflow-hidden rounded-[5px]">
        <div className="flex w-[calc(100%-100px)] items-baseline bg-[#fafafa] p-5">
          <em className="block w-[70px] text-[13px] text-[#888]">구매기간</em>

          <div className={searchClasses}>
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
            <div className={dateContainerClasses}>
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
            </div>
          </div>
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
      </div>
      <TableWrapper className={tableClasses}>
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
      </TableWrapper>
    </section>
  );
};
export default StoreOrderDelivery;
