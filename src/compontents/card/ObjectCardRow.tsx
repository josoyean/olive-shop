import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import BestIcon from "../BestIcon";
import type { CardImageType, CardProps } from "./card.type";
import { useNavigate } from "react-router-dom";
import { handlePrice } from "../../bin/common";

const ObjectCardRow: React.FC<CardProps> = (props) => {
  const { size, imgSize, data } = props;
  const navigate = useNavigate();
  return (
    <CardWapper
      $size={size}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.object_seq}`);
      }}
      $imgSize={imgSize}
      $soldOut={data?.soldOut}
    >
      <div className="img-box">
        <img src={data.img} alt="" />
        <em>품절</em>
      </div>

      <div className="text-box">
        <h5>{data.name}</h5>

        <div>
          <Count>
            {data.sale && <span>{(data.count ?? 0).toLocaleString()}원</span>}
            <em>
              {data?.option && "~"}
              {handlePrice(
                data?.sale,
                data?.count,
                data?.discount_rate
              ).toLocaleString()}
              원{data?.option && "~"}
            </em>
          </Count>
        </div>
        <TagWrapper>
          {data?.sale && <TagText className="sale">세일</TagText>}
          {data?.coupon && <TagText className="coupon">쿠폰</TagText>}
          {data?.one_more && (
            <TagText className="oneMore">{data.one_more}+1</TagText>
          )}
          {handlePrice(data?.sale, data?.count, data?.discount_rate) >
            20000 && <TagText className="free">무배</TagText>}
        </TagWrapper>
        {data.best && <BestIcon />}
      </div>
    </CardWapper>
  );
};

export default ObjectCardRow;

const CardWapper = styled.div<{
  $size: string;
  $imgSize: string;
  $soldOut: boolean;
}>`
  width: ${({ $size }) => $size};
  display: flex;
  row-gap: 10px;
  position: relative;
  cursor: pointer;
  > .img-box {
    position: relative;
    width: ${({ $imgSize }) => $imgSize};
    height: ${({ $imgSize }) => $imgSize};
    img {
      object-fit: cover;
      width: ${({ $imgSize }) => $imgSize};
      height: ${({ $imgSize }) => $imgSize};
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
    display: block;
    -webkit-box-orient: vertical;
    line-height: 18px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    word-break: keep-all;
    color: #000;
    font-weight: normal;
    font-size: 14px;
    text-align: left;
    width: 100%;
  }

  > div.text-box {
    padding: 8px;
    row-gap: 5px;
    display: flex;
    flex-direction: column;
    img {
      width: 30px;
      cursor: pointer;
    }
  }
`;

const Count = styled.div`
  display: flex;
  column-gap: 15px;
  flex-direction: column;

  span {
    color: #a9a9a9;
    font-size: ${theme.fontSize.small};
    text-decoration: line-through;
    vertical-align: middle;
    font-weight: 400;
  }

  em {
    color: ${theme.fontColor.red};
    font-size: 20px;
    font-weight: 700;
  }
`;
const TagWrapper = styled.div`
  justify-content: normal !important;
  column-gap: 1px;
`;

const TagText = styled.span`
  color: #fff;
  padding: 2px 5px;
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
