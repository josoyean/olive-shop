import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import type { CardProps } from "./card.type";
import BestIcon from "../BestIcon";
import { ProductPrice } from "../product/ProductPrice";
import { ProductTags } from "../product/ProductTags";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cn } from "@/lib/cn";

const ObjectCardColumn: React.FC<CardProps & { position?: 'right' | 'left' }> = ({ size, data, onClick ,position = 'left'}) => {
  const navigate = useNavigate();
  const { handleAddToCart, cartIconUrl } = useAddToCart();

  return (
    <article
      className="relative flex cursor-pointer flex-col"
      style={{ width: size }}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.object_seq}`);
        onClick?.();
      }}
    >
      <div className="relative mb-2.5" style={{ width: size, height: size }}>
        <img
          src={data?.img}
          alt={data?.name || ""}
          className={cn(
            "rounded-[3px] object-cover",
            data?.soldOut && "brightness-[0.8]"
          )}
          style={{ width: size, height: size }}
        />
        {data?.soldOut && (
          <em className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white">
            품절
          </em>
        )}
      </div>

      <h5
        className={cn(
          "overflow-hidden px-2 py-0.5 text-left text-sm font-normal leading-[18px] break-keep [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]",
          data?.soldOut ? "text-[#a8a8a8]" : "!text-black"
        )}
      >
        {data?.name}
      </h5>

      <div className="flex items-center justify-between px-2">
        <ProductPrice
          saleItem={data?.saleItem}
          count={data?.count}
          option={data?.option}
        />
        <img
          src={cartIconUrl}
          alt="shopping"
          aria-label="장바구니 추가"
          className="w-[30px] cursor-pointer"
          onClick={(event) => handleAddToCart(event, data)}
        />
      </div>

      <ProductTags data={data} className="tags" />

      {data && (
        <BestIcon
          best={data.best || false}
          position={position}
          today={
            moment().isBetween(
              data.saleItem?.start_today_sale_date,
              data.saleItem?.end_today_sale_date
            ) || false
          }
        />
      )}
    </article>
  );
};

export default ObjectCardColumn;
