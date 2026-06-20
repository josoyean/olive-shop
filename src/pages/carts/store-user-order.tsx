import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { paymentOrderData } from "../../api/axios-index";

const tableBoxClasses = cn(
  "mx-auto w-[80%] min-w-[787px]",
  "[&_h3]:font-light",
  "[&_table]:my-2.5 [&_table]:w-full [&_table]:border-t [&_table]:border-black",
  "[&_tr]:border-b [&_tr]:border-[#e6e6e6]",
  "[&_th]:w-[170px] [&_th]:border-b [&_th]:border-[#e6e6e6] [&_th]:bg-[#f4f4f4] [&_th]:p-[15px] [&_th]:text-left [&_th]:text-sm [&_th]:font-normal [&_th]:text-[#222]",
  "[&_td]:border-b [&_td]:border-[#e6e6e6] [&_td]:p-[15px] [&_td]:text-[13px]",
  "[&_td_input]:!text-[13px] [&_td_p]:mt-[5px] [&_td_p]:text-[10px] [&_td_p_em]:text-red-600"
);

const StoreUserOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userToken = useSelector((state: RootState) => state?.user.token);
  const [price, setPrice] = useState({
    totalCount: 0,
    disCount: 0,
    totalPrice: 0,
    countType: "",
    installment: 0,
  });
  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    enterType: "",
    enterText: "",
    enterMessage: "",
  });

  const handleData = async () => {
    paymentOrderData(userToken, location?.state?.orderId)
      .then((data) => {
        setPrice(data?.paymentInfo);
        setUser(data?.deliveryInfo);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    handleData();
  }, [location]);

  return (
    <div
      role="region"
      aria-label="주문 완료"
      className="relative z-[9] -mt-5 rounded-[5px] bg-white p-5"
    >
      <div className="title-box flex flex-col items-center justify-center gap-3 border-b border-t-2 border-black px-0 py-[50px] pb-[30px] pt-[50px]">
        <h2>
          주문이 <em className="text-red-600">완료</em>되었습니다
        </h2>
        <span className="rounded-[20px] bg-black px-[15px] py-[7px] text-center text-[13px] text-white">
          주문번호:<strong>Y{location?.state?.orderId}</strong>
        </span>
      </div>
      <div className="payment mx-auto mt-5 flex w-[80%] min-w-[787px] flex-col gap-10">
        <div className="w-full">
          <div className="w-full p-[15px]">
            <h3 className="mb-[15px] font-light">최종 결제정보</h3>
            <ul>
              <li className="flex justify-between py-2 [&>*]:text-[15px] [&>*]:font-extrabold [&>*]:text-[#222]">
                <em>총 상품금액</em>
                <span className="font-semibold">
                  {price?.totalCount?.toLocaleString()}원
                </span>
              </li>
              <li className="flex justify-between py-2 [&>*]:text-[15px] [&>*]:font-extrabold [&>*]:text-[#222]">
                <em>쿠폰할인금액</em>
                <span className="font-semibold text-star">
                  {price?.disCount === 0
                    ? "0"
                    : "-" + price?.disCount?.toLocaleString()}
                  원
                </span>
              </li>
              <li className="flex justify-between py-2 [&>*]:text-[15px] [&>*]:font-extrabold [&>*]:text-[#222]">
                <em>총 배송비</em>
                <span className="font-semibold">
                  {price?.totalPrice >= 20000 ? "0" : "2,500"}원
                </span>
              </li>
            </ul>
            <ul className="total mt-2.5 border-t border-black">
              <li className="flex justify-between p-5 [&>*]:text-[22px] [&>*]:font-semibold">
                <em>최종 결제금액</em>
                <strong className="text-center text-star">
                  <span className="mr-[7px] text-sm font-normal">
                    {price?.countType} (
                    {price?.installment === 1
                      ? "일시불"
                      : price?.installment + "개월"}
                    )
                  </span>
                  {price?.totalPrice >= 20000
                    ? price?.totalPrice?.toLocaleString()
                    : (price?.totalPrice + 2500)?.toLocaleString()}
                  원
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={tableBoxClasses}>
        <div>
          <h3>배송 정보</h3>
          <table>
            <thead>
              <tr>
                <th>받는분</th>
                <td>{user?.name}</td>
              </tr>
              <tr>
                <th>연락처</th>
                <td>{user?.phoneNumber}</td>
              </tr>
              <tr>
                <th>주소</th>
                <td>{user?.address}</td>
              </tr>
              <tr>
                <th>공동현관 출입방법</th>
                <td>{user?.enterType}</td>
              </tr>
              {user?.enterType !== "자유 출입 가능" && (
                <tr>
                  <th>{user?.enterType}</th>
                  <td>{user?.enterText}</td>
                </tr>
              )}
            </thead>
          </table>
        </div>
      </div>
      <div className="mt-10 border-t border-black p-5">
        <em className="text-xs font-normal">
          •주문취소는[결제완료]상태까지 가능 합니다.[배송 준비중],[배송중]에는
          상품 수령 후 반품 요청 부탁드립니다
        </em>
        <div className="my-[30px] flex items-center justify-center gap-[50px]">
          <button
            type="button"
            className="h-[50px] w-[150px] rounded-[5px] border border-primary text-center text-base font-semibold leading-[50px] text-primary"
            onClick={(event) => {
              event.preventDefault();
              navigate("/");
            }}
          >
            쇼핑계속
          </button>
          <button
            type="button"
            className="order h-[50px] w-[150px] rounded-[5px] border border-primary bg-primary text-center text-base font-semibold leading-[50px] text-white"
            onClick={(event) => {
              event.preventDefault();
              navigate("/store/mypage?t_page=주문배송");
            }}
          >
            주문 내역보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreUserOrder;
