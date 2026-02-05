import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  StarBox,
  TableStyle,
  Tabs,
  WhiteButton,
} from "../../../public/assets/style";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RootState } from "redex/store";
import { useSelector } from "react-redux";
import { supabase } from "../../supabase";
import moment from "moment";
import type {
  CardImageType,
  OrderType,
  PaymentObjectType,
  ReviewType,
} from "../../compontents/card/card.type";
import EmptyComponent from "../../compontents/EmptyComponent";
import { getStarWidth } from "../../bin/common";
import ModalContainer from "../../compontents/ModalContainer";
import ReviewWriteContainer from "./review-write-container";
import ReviewViewContainer from "./review-view-container";
import ReviewEditContainer from "./review-edit-container";
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
  return (
    <>
      <div>
        <Tabs grid={2} role="tablist" aria-label="리뷰 탭">
          <div className={type === "1" ? "on" : ""} role="tab" aria-selected={type === "1"}>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();

                setSearchParams({
                  t_page: "리뷰조회",
                  t_type: "1",
                });
              }}
            >
              리뷰 작성
            </button>
          </div>
          <div className={type === "2" ? "on" : ""} role="tab" aria-selected={type === "2"}>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();

                setSearchParams({
                  t_page: "리뷰조회",
                  t_type: "2",
                });
              }}
            >
              나의 리뷰
            </button>
          </div>
        </Tabs>

        <Container>
          <Table>
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
                                    src="/public/assets/images/icons/bg_rating_star.png"
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
          </Table>
        </Container>
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
          // formRef={formRef}
          // inputRef={inputRef}
          ref={formRef}
        />
      </ModalContainer>
    </>
  );
};

const Table = styled(TableStyle)`
  tbody td {
    padding: 20px 8px;
  }
  tbody {
    td {
      /* border-right: 1px solid #ccc; */
      &:last-child {
        border-right: none;
      }
    }
    td.date {
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }

    .objects {
      cursor: pointer;
      display: flex;
      column-gap: 20px;
      > div {
        padding-top: 5px;
        display: flex;
        flex-direction: column;
        row-gap: 7px;
        span {
          font-size: 14px;
          font-weight: 600;
        }
        strong {
          font-size: 14px;
        }
        em {
          font-size: 14px;
          overflow: hidden; // 너비를 넘어가면 안보이게
          text-overflow: ellipsis;
          display: block;
          white-space: nowrap;
          width: 350px;
        }
      }
      img {
        width: 90px;
        height: 90px;
        border-radius: 3px;
      }
    }

    .reviewBox {
      min-height: 90px;
      display: flex;
      padding-top: 5px;
      flex-direction: column;
      row-gap: 5px;
      span {
        font-size: 14px;
        font-weight: 600;
      }

      em {
        font-size: 14px;
        overflow: hidden; // 너비를 넘어가면 안보이게
        text-overflow: ellipsis;
        display: block;
        white-space: nowrap;
        width: 398px;
      }
    }
  }
`;
const Container = styled.div``;
export default MypageReviews;
