import React, { useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import type { CardImageType } from "./card.type";
import {
  handleCartCount,
  handlePrice,
  handlePriceTest,
  handleSaleTF,
} from "../../bin/common";
import type { RootState } from "redex/store";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addItemCart } from "../../pages/carts/addItemCart";

const HotDealCard = ({ data }: { data: CardImageType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = new Date().toISOString().split("T")[0];
  const userData = useSelector((state: RootState) => state?.user.token);

  return (
    <Container
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.object_seq}`);
      }}
    >
      <div className="img_box">
        <img src={data?.img} className="img" alt="" />
        <span>
          <span>
            {(data?.saleItem?.discount_rate || 0) +
              (data?.saleItem?.today_discount_rate || 0)}
            %
          </span>
        </span>

        {data?.soldOut && (
          <div>
            <em>품절</em>
          </div>
        )}
      </div>
      <div className="text_box">
        <img
          src="/public/assets/images/icons/shopping.png"
          alt="shopping"
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (userData === "") {
              if (
                window.confirm(`로그인후 이용해주세요\n로그인 하시겠습니까?`)
              ) {
                navigate("/login");
                return;
              }
            } else {
              if (data?.soldOut) {
                alert("품절된 상품입니다.");
                return;
              }
              addItemCart({ objects: data, addCount: 1, dispatch: dispatch });
            }
          }}
        />
        <em>{data?.name}</em>
        <Count>
          <em>
            {handlePrice(data?.saleItem, data?.count)?.toLocaleString()}원
            {data?.option && "~"}
          </em>
          {handleSaleTF(data?.saleItem) && (
            <span>{(data?.count ?? 0).toLocaleString()}원</span>
          )}
        </Count>

        <Tags>
          {handleSaleTF(data?.saleItem) && <span className="sale">세일</span>}
          {data?.coupon && <span className="coupon">쿠폰</span>}
          {data?.saleItem?.one_more && (
            <span className="oneMore">{data?.saleItem?.one_more}+1</span>
          )}
          {handlePrice(data?.saleItem, data?.count) >= 20000 && (
            <span className="free">무배</span>
          )}
          {today === data?.saleItem?.today_sale_date && (
            <span className="today_sale">오특</span>
          )}
        </Tags>
      </div>
    </Container>
  );
};

const Tags = styled.div`
  span {
    float: left;
    margin-right: 3px;
    padding: 0 5px;
    font-size: 12px;
    line-height: 16px;
    border: 1px solid #666;
    border-radius: 2.5px;
    margin-left: 0;
    &.sale {
      color: #f65c60;
      border-color: #f65c60;
    }
    &.coupon {
      color: #9bce26;
      border-color: #9bce26;
    }
    &.free {
      color: #ad85ed;
      border-color: #ad85ed;
    }
    &.oneMore {
      color: #ff8942;
      border-color: #ff8942;
    }
    &.today_sale {
      color: #6fcff7;
      border-color: #6fcff7;
    }
  }
`;
const Count = styled.div`
  display: flex;
  align-items: center;
  column-gap: 13px;

  span {
    color: #a9a9a9;
    font-size: 17px;
    text-decoration: line-through;
    vertical-align: middle;
    font-weight: 400;
  }

  em {
    color: #000;
    font-size: 25px;
    font-weight: 600;
  }
`;
const Container = styled.div`
  width: 500px;
  cursor: pointer;
  .img_box {
    height: 255px;
    width: 500px;
    position: relative;
    background-color: rgba(184, 184, 184, 0.3);
    img {
      /* width: auto; */
      /* height: auto; */
      width: 255px;
      height: 255px;
      margin: auto;
      display: block;
      object-fit: cover;
    }
    > span {
      width: 60px;
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 9;
      height: 60px;
      background: url("/public/assets/images/icons/pc_flag.png") 0 0 / 60px 60px
        no-repeat;
      z-index: 1;
      display: block;
      > span {
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        text-align: center;
        line-height: 60px;
        display: block;
      }
    }

    > div {
      width: 255px;
      height: 255px;
      background-color: rgba(0, 0, 0, 0.5);
      position: absolute;
      bottom: 0;
      top: 0;
      left: 50%;
      right: 0;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      padding: 0 10px;
      border-radius: 3px;
      z-index: 1;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
    }
  }

  .text_box {
    display: flex;
    flex-direction: column;
    row-gap: 7px;
    margin-top: 20px;
    img {
      width: 30px;
      cursor: pointer;
      margin-left: auto;
    }
    > em {
      color: #000;
      font-size: 16px;
    }
  }
`;
export default HotDealCard;
