import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import type { CardProps } from "./card.type";
import BestIcon from "../BestIcon";
import { ProductPrice } from "../product/ProductPrice";
import { ProductTags } from "../product/ProductTags";
import { cn } from "@/lib/cn";

const ObjectCardRow: React.FC<CardProps> = ({ size, imgSize, data, onClick }) => {
  const navigate = useNavigate();

  return (
    <article
      role="article"
      className="relative flex cursor-pointer gap-2.5"
      style={{ width: size }}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.object_seq}`);
        onClick?.();
      }}
    >
      <div className="relative" role="group" style={{ width: imgSize, height: imgSize }}>
        <img
          role="img"
          src={data?.img}
          alt={data?.name || "상품 이미지"}
          className={cn(
            "rounded-[3px] object-cover",
            data?.soldOut && "brightness-[0.8]"
          )}
          style={{ width: imgSize, height: imgSize }}
        />
        {data?.soldOut && (
          <em className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white">
            품절
          </em>
        )}
      </div>

      <div className="flex flex-col gap-[5px] p-2" role="group">
        <h5
          role="heading"
          aria-level={3}
          className="line-clamp-2 w-full text-left text-sm font-normal leading-[18px] text-black break-keep"
        >
          {data?.name}
        </h5>

        <ProductPrice
          saleItem={data?.saleItem}
          count={data?.count}
          option={data?.option}
          layout="row"
        />

        <ProductTags data={data} />

        <BestIcon
          best={data?.best || false}
          today={
            moment().isBetween(
              data?.saleItem?.start_today_sale_date,
              data?.saleItem?.end_today_sale_date
            ) || false
          }
        />
      </div>
    </article>
  );
};

export default ObjectCardRow;
