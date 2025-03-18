import React, { useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import type { CardImageType, HotDealCardType } from "./card.type";
import { handleCartCount, handlePrice } from "../../bin/common";
import type { RootState } from "redex/store";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../pages/carts/addToCart";
import { modify } from "../../redex/reducers/userCartCount";
const HotDealCard = ({ data }: { data: HotDealCardType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state?.user.token);

  return (
    <Container
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.objects?.object_seq}`);
        window.scrollTo(0, 0);
      }}
    >
      <div className="img_box">
        <img src={data?.objects?.img} className="img" alt="" />
        <span>
          <span>{data?.objects?.discount_rate}%</span>
        </span>

        {data?.objects?.soldOut && (
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
              alert("로그인후 이용해주세요");
              navigate("/login");
              return;
            } else {
              alert("장바구니에 추가되었습니다");
              const add = addToCart({ dataInfo: data?.objects, addCount: 1 });
              if (await add) {
                const cartCount = await handleCartCount(userData);

                dispatch(modify(cartCount ?? 0));
              }
            }
          }}
        />
        <em>{data?.objects?.name}</em>
        <Count>
          <em>
            {handlePrice(
              true,
              data?.objects?.count,
              data?.objects?.discount_rate
            )?.toLocaleString()}
            원{data?.objects?.option && "~"}
          </em>
          {<span>{(data?.objects?.count ?? 0).toLocaleString()}원</span>}
        </Count>
        <Tags>
          {data?.objects?.sale && <span className="sale">세일</span>}
          {data?.objects?.coupon && <span className="coupon">쿠폰</span>}
          {handlePrice(
            data.objects?.sale,
            data.objects?.count,
            data.objects?.discount_rate
          ) > 20000 && <span className="free">무배</span>}
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
      background-color: #ad85ed;
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
