import React from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import BestIcon from "../BestIcon";
import type { RootState } from "../../redex/store";
import type { CardProps } from "./card.type";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handlePrice, handleSaleTF } from "../../bin/common";
import { addItemCart } from "../../pages/carts/addItemCart";

const ObjectCardColumn: React.FC<CardProps> = (props) => {
  const { size, data, onClick } = props;
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state?.user.token);
  const dispatch = useDispatch();

  return (
    <CardWapper
      $size={size}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.object_seq}`);
        onClick?.();
      }}
      $soldOut={data?.soldOut ?? false}
    >
      <div className="img-box">
        <img src={data?.img} alt="" />
        <em>품절</em>
      </div>
      <h5>{data?.name}</h5>

      <div className="text-box">
        <Count>
          {handleSaleTF(data?.saleItem) && (
            <span>{(data?.count ?? 0).toLocaleString()}원</span>
          )}
          <em>
            {handlePrice(data?.saleItem, data?.count).toLocaleString()}원
            {data?.option && "~"}
          </em>
        </Count>
        <img
          src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/sign/images/shopping.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYTBjYzg1NC1jMWE5LTQ2MTktYTBiNy1iMTdmMGE2ZGE3MWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvc2hvcHBpbmcucG5nIiwiaWF0IjoxNzYxNTQ5NjIxLCJleHAiOjE3OTMwODU2MjF9.oQy-e0T_PPu_HfDoEaqJx3kVKnLzyeQTS5MuOI8VwqY"
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
              addItemCart({
                objects: { ...data, addCount: 1 },
                dispatch: dispatch,
              });
            }
          }}
        />
      </div>
      <TagWrapper className="tags">
        {handleSaleTF(data?.saleItem) && (
          <TagText className="sale">세일</TagText>
        )}
        {data?.coupon && <TagText className="coupon">쿠폰</TagText>}
        {!data?.saleItem ||
          (data?.saleItem?.one_more && (
            <TagText className="oneMore">{data?.saleItem?.one_more}+1</TagText>
          ))}
        {handlePrice(data?.saleItem, data?.count) >= 20000 && (
          <TagText className="free">무배</TagText>
        )}
      </TagWrapper>
      {data?.best && <BestIcon />}
    </CardWapper>
  );
};

export default ObjectCardColumn;

const CardWapper = styled.div<{ $size: string; $soldOut: boolean }>`
  width: ${({ $size }) => $size};
  display: flex;
  flex-direction: column;
  /* row-gap: 4px; */
  position: relative;
  cursor: pointer;
  > .img-box {
    position: relative;
    margin-bottom: 10px;
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
    img {
      object-fit: cover;
      width: ${({ $size }) => $size};
      height: ${({ $size }) => $size};
      border-radius: 3px;
      filter: ${({ $soldOut }) => ($soldOut ? "brightness(0.8)" : "unset")};
    }
    em {
      display: ${({ $soldOut }) => ($soldOut ? "block" : "none")};
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      border-radius: 3px;
    }
  }

  h5 {
    overflow: hidden;
    /* height: 40px; */
    padding: 2px 8px;
    -webkit-box-orient: vertical;
    line-height: 18px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    word-break: keep-all;

    font-weight: normal;
    font-size: 14px;
    text-align: left;
    color: ${({ $soldOut }) => ($soldOut ? "#a8a8a8" : "#000")};
  }

  > div.text-box {
    padding: 0px 8px;

    justify-content: space-between;
    align-items: center;
    display: flex;
    img {
      width: 30px;
      cursor: pointer;
    }
  }
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;

  span {
    color: #a9a9a9;
    font-size: ${theme.fontSize.small};
    text-decoration: line-through;
    vertical-align: middle;
    font-weight: 400;
  }

  em {
    color: ${theme.fontColor.red};
    font-size: 18px;
    font-weight: 700;
  }
`;
const TagWrapper = styled.div`
  justify-content: normal !important;
  column-gap: 1px;
`;

const TagText = styled.span`
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: ${theme.fontSize.small};
  margin-right: 2px;
  &.sale {
    background-color: #f65c60;
  }
  &.coupon {
    background-color: #9bce26;
  }
  &.free {
    background-color: #ad85ed;
  }
  &.oneMore {
    background-color: #ff8942;
  }
`;
