import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redex/store";
import { supabase } from "../../supabase";
import { theme } from "../../../public/assets/styles/theme";

const StoreUserOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userToken = useSelector((state: RootState) => state?.user.token);
  // const price = location.state.price;
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
    const { data, error: cartError } = await supabase
      .from("payment")
      .select("*")
      .eq("userId", userToken)
      .eq("orderId", location?.state?.orderId)
      .single();

    setPrice(data?.paymentInfo);
    setUser(data?.deliveryInfo);
  };

  useEffect(() => {
    handleData();
  }, [location]);
  return (
    <Container>
      <div className="title-box">
        <h2>
          주문이 <em>완료</em>되었습니다
        </h2>
        <span>
          주문번호:<strong>Y{location?.state?.orderId}</strong>
        </span>
      </div>
      <PaymentBox className="payment">
        <div>
          <PaymentInfo>
            <h3>최종 결제정보</h3>
            <ul>
              <li>
                <em>총 상품금액</em>
                <span>{price?.totalCount?.toLocaleString()}원</span>
              </li>

              <li>
                <em>쿠폰할인금액</em>
                <span className="color">
                  {price?.disCount === 0
                    ? "0"
                    : "-" + price?.disCount?.toLocaleString()}
                  원
                </span>
              </li>
              <li>
                <em>총 배송비</em>
                <span>{price?.totalPrice >= 20000 ? "0" : "2,500"}원</span>
              </li>
            </ul>
            <ul className="total">
              <li>
                <em>최종 결제금액</em>
                <strong className="color">
                  <span>
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
          </PaymentInfo>
        </div>
      </PaymentBox>
      <TableBox>
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
      </TableBox>
      <ButtonBox>
        <em>
          •주문취소는[결제완료]상태까지 가능 합니다.[배송 준비중],[배송중]에는
          상품 수령 후 반품 요청 부탁드립니다
        </em>
        <div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              navigate("/");
            }}
          >
            쇼핑계속
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              alert("준비중 입니다");
            }}
            className="order"
          >
            주문 내역보기
          </button>
        </div>
      </ButtonBox>
    </Container>
  );
};
const ButtonBox = styled.div`
  padding: 20px;
  border-top: 1px solid #000;
  margin-top: 40px;
  > em {
    font-size: 12px;
    font-weight: 400;
  }
  > div {
    display: flex;
    align-items: center;
    margin: 30px 0;
    column-gap: 50px;
    justify-content: center;
    button {
      width: 150px;
      height: 50px;
      line-height: 50px;
      border-radius: 5px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      color: ${({ theme }) => theme.color.main};
      border: 1px solid ${({ theme }) => theme.color.main};
      &.order {
        background-color: ${({ theme }) => theme.color.main};
        color: #fff;
      }
    }
  }
`;
const TableBox = styled.div`
  width: 80%;
  min-width: 787px;
  margin: 0 auto;

  h3 {
    font-weight: 300;
  }

  table {
    margin: 10px 0;
    width: 100%;
    border-top: 1px solid #000;

    tr {
      border-bottom: 1px solid #e6e6e6;
      th {
        padding: 15px;
        width: 170px;
        background: #f4f4f4;
        border-bottom: 1px solid #e6e6e6;
        text-align: left;
        color: #222;
        font-weight: 400;
        font-size: 14px;
      }
      td {
        padding: 15px;
        font-size: 13px;
        border-bottom: 1px solid #e6e6e6;
        input {
          font-size: 13px !important;
        }
        p {
          font-size: 10px;
          margin-top: 5px;
          em {
            color: red;
          }
        }
      }
    }
  }
`;
const PaymentInfo = styled.div`
  width: 100%;
  padding: 15px;
  /* margin: 5px 0; */

  li {
    display: flex;
    padding: 8px 0;
    justify-content: space-between;
    > * {
      color: #222;
      font-size: 15px;
      font-weight: 800;
    }
    span {
      font-weight: 600;
      &.color {
        color: #f27370;
      }
    }
  }

  .total {
    /* padding: 10px 0; */
    margin-top: 10px;
    border-top: 1px solid #000;
    li {
      padding: 20px;
      > * {
        font-size: 22px;
        font-weight: 600;

        span {
          font-weight: 400;
          font-size: 14px;
          margin-right: 7px;
        }
      }
      strong {
        color: #f27370;
        text-align: center;
      }
    }
    button {
      width: 100%;
      padding: 15px;
      display: block;
      border-radius: 5px;
      color: #fff;
      font-size: 19px;
      background-color: #f27370;
    }
  }
`;
const PaymentBox = styled.div`
  display: flex;
  column-gap: 40px;
  width: 80%;
  min-width: 787px;
  flex-direction: column;
  margin: 20px auto 0;
  > div {
    width: 100%;
  }
  h3 {
    font-weight: 300;
    margin-bottom: 15px;
  }
  .MuiFormControlLabel-label {
    font-size: 13px;
    color: #000;
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
    padding: 50px 0 30px;
    border-top: 2px solid #000;
    display: flex;
    row-gap: 12px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #000;
    h2 em {
      color: red;
    }
    > span {
      color: #fff;
      padding: 7px 15px;
      font-size: 13px;
      text-align: center;
      border-radius: 20px;
      background-color: #000;
    }
    .gray_btn {
      width: 90px;
    }
  }
`;
export default StoreUserOrder;
