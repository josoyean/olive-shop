import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { cn } from "@/lib/cn";

interface CardsType {
  count: number;
  gridCount?: number;
  width: string;
  gap?: string;
  style?: React.CSSProperties;
}
const Cards = ({ width, count, gridCount = 4, style }: CardsType) => {
  return (
    <div
      className="grid w-full justify-between"
      style={{
        ...style,
        gridTemplateColumns: `repeat(${gridCount},${width})`,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          className={cn("[&>div]:flex [&>div]:items-center [&>div]:justify-between [&_.test]:h-10 [&_.test]:w-10")}
          style={{ width: width }}
          key={index}
        >
          <Skeleton width={width} height={width} />
          <Skeleton width={width} count={2} />
          <div>
            <Skeleton width={"150px"} />
            <Skeleton width={"40px"} height={"40px"} circle className="test" />
          </div>
          <Skeleton width={"170px"} />
        </div>
      ))}
    </div>
  );
};

export default Cards;
