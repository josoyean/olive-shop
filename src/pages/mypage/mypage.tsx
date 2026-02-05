import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import type { RootState } from "../../redex/store";
import { useSelector } from "react-redux";
import { supabase } from "../../supabase";
import { isToday } from "../../bin/common";
import moment from "moment";
import {
  PaymentType,
  ReviewType,
  type CardImageType,
  type OrderType,
} from "../../compontents/card/card.type";

import { useSearchParams } from "react-router-dom";

interface OrderDataType {
  [key: string]: OrderType[];
}

const Mypage = () => {
  const [, setSearchParams] = useSearchParams();
  const userToken = useSelector((state: RootState) => state?.user.token);

  const [orderData, setOrderData] = useState<OrderDataType>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });

  const [reviewPossibleData, setReviewPossibleData] = useState<PaymentType[]>(
    []
  );
  const [myReview, setMyReview] = useState<ReviewType[]>([]);

  const handleDataLoad = useCallback(
    async (token: string) => {
      const { data: paymentData } = await supabase
        .from("payment")
        .select("*")
        .eq("userId", token)
        .gte(
          "created_at",
          moment
            .utc(isToday)
            .add(9, "hours")
            .subtract(1, "months")
            .toISOString()
        )
        .lte("created_at", moment.utc(isToday).add(9, "hours").toISOString()); // 오늘 날짜 <=

      paymentData?.map((item) => {
        setOrderData((prevState) => ({
          ...prevState,
          [item.deliveryStep]: [...prevState[item.deliveryStep], item],
        }));
      });

      // 리뷰 작성 가능한 데이터 (배송 완료)

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

      setReviewPossibleData(
        paymentsData?.flatMap((item) =>
          item.objectsInfo.map((obj: CardImageType) => ({
            ...obj,
            delivered_at: item.delivered_at,
            created_at: item.created_at,
          }))
        ) || []
      );

      // 리뷰 작성 완료
      const { data: myReviewData } = await supabase
        .from("reviews")
        .select("*,objectInfo(*)")
        .eq("userId", token);
      //.in("payment_seq", result || []);

      setMyReview(myReviewData || []);
    },
    [userToken]
  );
  useEffect(() => {
    handleDataLoad(userToken);
  }, [handleDataLoad]);

  return (
    <section role="region" aria-label="마이페이지">
      {/* 주문/배송 조회 */}
      <OrderBox role="region" aria-label="주문/배송 조회">
        <div className="text-box">
          <div>
            <h2>주문/배송 조회</h2>
            <em>(최근 1개월)</em>
          </div>
          <span
            onClick={(event) => {
              event.preventDefault();
              setSearchParams({
                t_page: "주문배송",
              });
            }}
          >
            더보기 &gt;
          </span>
        </div>
        <ul className="order-box" role="list" aria-label="주문 상태">
          <li role="listitem">
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
      {/* 리뷰 */}
      <OrderBox role="region" aria-label="리뷰 조회">
        <div className="text-box">
          <div>
            <h2>리뷰 조회</h2>
          </div>
          <span
            onClick={(event) => {
              event.preventDefault();
              setSearchParams({
                t_page: "리뷰조회",
                t_type: "1",
              });
            }}
          >
            더보기 &gt;
          </span>
        </div>
        <ul className="review-box" role="list" aria-label="리뷰 상태">
          <li
            role="listitem"
            onClick={(event) => {
              event.preventDefault();
              setSearchParams({
                t_page: "리뷰조회",
                t_type: "1",
              });
            }}
          >
            <em>{reviewPossibleData?.length}</em>
            <span>작성 가능</span>
          </li>
          <li
            role="listitem"
            onClick={(event) => {
              event.preventDefault();
              setSearchParams({
                t_page: "리뷰조회",
                t_type: "2",
              });
            }}
          >
            <em>{myReview?.length}</em>
            <span>나의 리뷰</span>
          </li>
        </ul>
      </OrderBox>
    </section>
  );
};

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
      em {
        font-size: 12px;
      }
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
    column-gap: 30px;
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

export default Mypage;
