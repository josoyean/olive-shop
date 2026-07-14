import { useEffect, useRef, useState } from "react";
import { StarBox, TabItem, TableWrapper, Tabs, WhiteButton } from "@/components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RootState } from "redux/store";
import { useSelector } from "react-redux";
import { supabase } from "../../supabase";
import moment from "moment";
import type {
  CardImageType,
  OrderType,
  PaymentObjectType,
  ReviewType,
} from "../../components/card/card.type";
import EmptyComponent from "../../components/EmptyComponent";
import { getStarWidth } from "../../utils/common";
import ModalContainer from "../../components/ModalContainer";
import ReviewWriteContainer from "./review-write-container";
import ReviewViewContainer from "./review-view-container";
import ReviewEditContainer from "./review-edit-container";
import { cn } from "@/lib/cn";

const MypageReviews = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useSelector((state: RootState) => state?.user.token);
  const type = searchParams.get("t_type");

  const [writeReview, setWriteReview] = useState<PaymentObjectType[]>([]);
  const [viewReview, setViewReview] = useState<ReviewType | null>(null);
  const [payments, setPayments] = useState<OrderType[]>([]);
  const [orders, setOrders] = useState<PaymentObjectType[]>([]);
  const [myReview, setMyReview] = useState<ReviewType[]>([]);
  const [selectReview, setSelectReview] = useState<PaymentObjectType | null>(
    null
  );

  const [openedWriteReview, setOpenedWriteReview] = useState<boolean>(false);
  const [openedEditReview, setOpenedEditReview] = useState<boolean>(false);
  const [openedViewReview, setOpenedViewReview] = useState<boolean>(false);

  const handleData = async () => {
    const { data: paymentsData } = await supabase
      .from("payment")
      .select("*,objectsInfo")
      .eq("userId", token)
      .eq("paymentCancel", "False")
      .eq("deliveryStep", "5")
      .gte(
        "delivered_at",
        moment.utc().subtract(3, "months").add(9, "hours").toISOString()
      )
      .lte("delivered_at", moment.utc().add(9, "hours").toISOString());

    setWriteReview(
      paymentsData?.flatMap((item) =>
        item.objectsInfo.map((obj: CardImageType) => ({
          ...obj,
          delivered_at: item.delivered_at,
          created_at: item.created_at,
          orderId: item.orderId,
        }))
      ) || []
    );

    setPayments(
      paymentsData?.flatMap((item) =>
        item.objectsInfo.map((obj: CardImageType) => ({
          ...obj,
          delivered_at: item.delivered_at,
          created_at: item.created_at,
          orderId: item.orderId,
        }))
      ) || []
    );

    const { data: reviewData } = await supabase
      .from("reviews")
      .select("*,objectInfo(*)")
      .eq("userId", token);

    setMyReview(reviewData || []);
  };
  useEffect(() => {
    handleData();
  }, []);

  const handleWriteReview = () => {
    setOpenedWriteReview(false);
    setOpenedEditReview(false);
    handleData();
  };

  const tableClass = cn(
    "[&_tbody_td]:px-2 [&_tbody_td]:py-5",
    "[&_tbody_td:last-child]:border-r-0",
    "[&_tbody_td.date]:text-center [&_tbody_td.date]:text-sm [&_tbody_td.date]:font-medium",
    "[&_.objects]:flex [&_.objects]:cursor-pointer [&_.objects]:gap-5",
    "[&_.objects>div]:flex [&_.objects>div]:flex-col [&_.objects>div]:gap-[7px] [&_.objects>div]:pt-[5px]",
    "[&_.objects>div_em]:block [&_.objects>div_em]:overflow-hidden [&_.objects>div_em]:text-ellipsis [&_.objects>div_em]:whitespace-nowrap [&_.objects>div_em]:text-sm [&_.objects>div_em]:w-[350px]",
    "[&_.objects>div_strong]:text-sm [&_.objects>div_span]:text-sm [&_.objects>div_span]:font-semibold",
    "[&_.objects_img]:h-[90px] [&_.objects_img]:w-[90px] [&_.objects_img]:rounded-[3px]",
    "[&_.reviewBox]:flex [&_.reviewBox]:min-h-[90px] [&_.reviewBox]:flex-col [&_.reviewBox]:gap-[5px] [&_.reviewBox]:pt-[5px]",
    "[&_.reviewBox_em]:block [&_.reviewBox_em]:overflow-hidden [&_.reviewBox_em]:text-ellipsis [&_.reviewBox_em]:whitespace-nowrap [&_.reviewBox_em]:text-sm [&_.reviewBox_em]:w-[398px]",
    "[&_.reviewBox_span]:text-sm [&_.reviewBox_span]:font-semibold"
  );

  return (
    <>
      <div>
        <Tabs grid={2} role="tablist" aria-label="리뷰 탭">
          <TabItem
            active={type === "1"}
            onClick={() => {
              setSearchParams({
                t_page: "리뷰조회",
                t_type: "1",
              });
            }}
          >
            리뷰 작성
          </TabItem>
          <TabItem
            active={type === "2"}
            onClick={() => {
              setSearchParams({
                t_page: "리뷰조회",
                t_type: "2",
              });
            }}
          >
            나의 리뷰
          </TabItem>
        </Tabs>

        <div>
          <TableWrapper className={tableClass}>
            {type === "1" ? (
              <table>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "300px" }}>
                      상품
                    </th>
                    <th scope="col" style={{ width: "100px" }}>
                      작성기간
                    </th>
                    <th scope="col" style={{ width: "100px" }}>
                      리뷰 작성
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {writeReview?.length > 0 ? (
                    writeReview.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(
                                `/store/goods-detail?getGoods=${item?.object_seq}`
                              );
                            }}
                          >
                            <div className="objects">
                              <img src={item.img} alt="objects" />
                              <div>
                                <span>
                                  주문일자
                                  {`  ${moment(item.created_at).format(
                                    "YYYY.MM.DD"
                                  )}`}
                                </span>
                                <strong
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    navigate(
                                      `/store/brand-detail?getBrand=${item?.brand_seq}`
                                    );
                                  }}
                                >
                                  {item.brand}
                                </strong>
                                <em>{item.name}</em>
                              </div>
                            </div>
                          </td>
                          <td className="date">
                            ~
                            {moment(item.delivered_at)
                              .add(3, "months")
                              .format("YYYY.MM.DD")}
                          </td>

                          <td style={{ textAlign: "center" }}>
                            <WhiteButton
                              width="90px"
                              height="27px"
                              style={{
                                color: "#000",
                                border: "1px solid #000",
                              }}
                              onClick={(event) => {
                                event.preventDefault();
                                setSelectReview(item);
                                setOpenedWriteReview(true);
                                const paymentItem = payments?.filter(
                                  (_) => _.orderId === item.orderId
                                );
                                setOrders(paymentItem || []);
                              }}
                            >
                              리뷰 작성하기
                            </WhiteButton>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <EmptyComponent
                          mainText={"작성 가능한 리뷰가 없습니다"}
                          subText=""
                        ></EmptyComponent>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "40%" }}>
                      상품
                    </th>
                    <th scope="col" style={{ width: "60%" }}>
                      리뷰
                    </th>
                    <th scope="col" style={{ width: "100px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {myReview?.length > 0 ? (
                    myReview?.map((item, index) => (
                      <tr key={index}>
                        <td
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(
                              `/store/goods-detail?getGoods=${item?.objectInfo?.object_seq}`
                            );
                          }}
                        >
                          <div className="objects">
                            <img src={item?.objectInfo?.img} alt="objects" />
                            <div>
                              <span>
                                주문일자
                                {`  ${moment(item.order_at).format(
                                  "YYYY.MM.DD"
                                )}`}
                              </span>
                              <strong
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate(
                                    `/store/brand-detail?getBrand=${item?.objectInfo?.brand_seq}`
                                  );
                                }}
                              >
                                {item?.objectInfo?.brand}
                              </strong>
                              <em style={{ width: "150px" }}>
                                {item?.objectInfo?.name}
                              </em>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="reviewBox">
                            <span>
                              작성일자
                              {`  ${moment(item.created_at).format(
                                "YYYY.MM.DD"
                              )}`}
                            </span>
                            <StarBox size="20px">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <li key={i}>
                                  <span
                                    className="rating"
                                    style={{
                                      width: getStarWidth(i, item?.score ?? 0),
                                    }}
                                  />
                                  <img
                                    src="/assets/images/icons/bg_rating_star.png"
                                    alt="bg_rating_star"
                                  />
                                </li>
                              ))}
                            </StarBox>

                            <em>{item?.reviewText}</em>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              textAlign: "center",
                              display: "flex",
                              flexDirection: "column",
                              rowGap: "7px",
                            }}
                          >
                            <WhiteButton
                              width="80px"
                              height="27px"
                              style={{
                                color: "#000",
                                border: "1px solid #000",
                              }}
                              onClick={(event) => {
                                event.preventDefault();
                                console.log(item);
                                if (!item.objectInfo?.object_seq) return;
                                setViewReview(item);
                                setOpenedEditReview(true);
                              }}
                            >
                              리뷰수정
                            </WhiteButton>
                            <WhiteButton
                              width="80px"
                              height="27px"
                              style={{
                                color: "#000",
                                border: "1px solid #000",
                              }}
                              onClick={async (event) => {
                                event.preventDefault();
                                console.log(item);
                                if (!item.objectInfo?.object_seq) return;
                                setViewReview(item);
                                setOpenedViewReview(true);
                              }}
                            >
                              리뷰보기
                            </WhiteButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <EmptyComponent
                          mainText={"작성한 리뷰 내역이 없습니다"}
                          subText=""
                        ></EmptyComponent>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </TableWrapper>
        </div>
      </div>
      <ModalContainer
        isOpen={openedWriteReview}
        onClose={() => setOpenedWriteReview(false)}
        widthCheck={"700px"}
        header={`리뷰 작성`}
        heightCheck="700px"
        formRef={formRef}
        okText="저장하기"
      >
        <ReviewWriteContainer
          data={{
            selectReview: selectReview,
            orders: orders,
            handleWriteReview: handleWriteReview,
          }}
          ref={formRef}
        />
      </ModalContainer>

      <ModalContainer
        isOpen={openedViewReview}
        onClose={() => setOpenedViewReview(false)}
        widthCheck={"700px"}
        header="리뷰 보기"
        heightCheck="700px"
        formRef={formRef}
        handleOk={() => {
          setOpenedViewReview(false);
        }}
        okText="닫기"
      >
        <ReviewViewContainer data={{ viewReview: viewReview }} ref={formRef} />
      </ModalContainer>

      <ModalContainer
        isOpen={openedEditReview}
        onClose={() => setOpenedEditReview(false)}
        widthCheck={"700px"}
        header={`리뷰 수정`}
        heightCheck="700px"
        formRef={formRef}
        okText="저장하기"
      >
        <ReviewEditContainer
          data={{
            selectReview: viewReview,
            orders: orders,
            handleWriteReview: handleWriteReview,
          }}
          ref={formRef}
        />
      </ModalContainer>
    </>
  );
};

export default MypageReviews;
