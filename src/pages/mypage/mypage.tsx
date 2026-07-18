import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";
import type { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { supabase } from "../../supabase";
import { isToday } from "../../utils/common";
import moment from "moment";
import {
  PaymentType,
  ReviewType,
  type CardImageType,
  type OrderType,
} from "../../components/card/card.type";
import { useSearchParams } from "react-router-dom";

interface OrderDataType {
  [key: string]: OrderType[];
}

const orderBoxClasses = cn(
  "mt-[60px]",
  "[&_.text-box]:flex [&_.text-box]:items-center [&_.text-box]:justify-between",
  "[&_.text-box>div]:flex [&_.text-box>div]:items-baseline [&_.text-box>div]:gap-2.5",
  "[&_.text-box_em]:text-xs [&_.text-box_span]:cursor-pointer [&_.text-box_span]:text-sm",
  "[&_.order-box]:mt-5 [&_.order-box]:grid [&_.order-box]:h-[117px] [&_.order-box]:w-full [&_.order-box]:grid-cols-5 [&_.order-box]:overflow-hidden [&_.order-box]:rounded-[10px] [&_.order-box]:bg-[#f5f5f5]",
  "[&_.review-box]:mt-5 [&_.review-box]:grid [&_.review-box]:w-full [&_.review-box]:grid-cols-2 [&_.review-box]:gap-[30px]",
  "[&_.review-box_li]:h-[117px] [&_.review-box_li]:cursor-pointer [&_.review-box_li]:flex-row-reverse [&_.review-box_li]:gap-2.5 [&_.review-box_li]:rounded-[10px] [&_.review-box_li]:bg-[#f5f5f5]",
  "[&_li]:relative [&_li]:flex [&_li]:flex-col [&_li]:items-center [&_li]:justify-center",
  "[&_li_em]:text-[40px] [&_li_em]:font-medium [&_li_em]:not-italic [&_li_em]:text-[#888]",
  "[&_li_em.on]:text-primary [&_li_span]:text-base [&_li_span]:text-[#666]",
  "[&_.review-box_li_em]:text-primary"
);

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
        .lte("created_at", moment.utc(isToday).add(9, "hours").toISOString());

      paymentData?.map((item) => {
        setOrderData((prevState) => ({
          ...prevState,
          [item.deliveryStep]: [...prevState[item.deliveryStep], item],
        }));
      });

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

      const { data: myReviewData } = await supabase
        .from("reviews")
        .select("*,objectInfo(*)")
        .eq("userId", token);

      setMyReview(myReviewData || []);
    },
    [userToken]
  );

  useEffect(() => {
    handleDataLoad(userToken);
  }, [handleDataLoad]);

  return (
    <section role="region" aria-label="마이페이지">
      <div className={orderBoxClasses} role="region" aria-label="주문/배송 조회">
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
            <span className="inline-flex items-center gap-0.5">
              더보기
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </span>
          </span>
        </div>
        <ul className="order-box" role="list" aria-label="주문 상태">
          <li role="listitem">
            <em className={cn(orderData[1]?.length > 0 && "on")}>
              {orderData[1]?.length || 0}
            </em>
            <span>주문접수</span>
            <ChevronRight
              className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 text-[#888]"
              aria-hidden
            />
          </li>
          <li>
            <em className={cn(orderData[2]?.length > 0 && "on")}>
              {orderData[2]?.length || 0}
            </em>
            <span>결제완료</span>
            <ChevronRight
              className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 text-[#888]"
              aria-hidden
            />
          </li>
          <li>
            <em className={cn(orderData[3]?.length > 0 && "on")}>
              {orderData[3]?.length || 0}
            </em>
            <span>배송준비중</span>
            <ChevronRight
              className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 text-[#888]"
              aria-hidden
            />
          </li>
          <li>
            <em className={cn(orderData[4]?.length > 0 && "on")}>
              {orderData[4]?.length || 0}
            </em>
            <span>배송중</span>
            <ChevronRight
              className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 text-[#888]"
              aria-hidden
            />
          </li>
          <li>
            <em className={cn(orderData[5]?.length > 0 && "on")}>
              {orderData[5]?.length || 0}
            </em>
            <span>배송완료</span>
          </li>
        </ul>
      </div>
      <div className={orderBoxClasses} role="region" aria-label="리뷰 조회">
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
            <span className="inline-flex items-center gap-0.5">
              더보기
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </span>
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
      </div>
    </section>
  );
};

export default Mypage;
