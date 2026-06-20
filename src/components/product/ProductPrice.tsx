import type { SaleType } from "@/components/card/card.type";
import { handlePrice, handleSaleTF } from "@/utils/common";
import { cn } from "@/lib/cn";

interface ProductPriceProps {
  saleItem?: SaleType | null;
  count?: number;
  option?: boolean;
  layout?: "column" | "row" | "hotdeal";
  className?: string;
}

export function ProductPrice({
  saleItem,
  count,
  option,
  layout = "column",
  className,
}: ProductPriceProps) {
  const price = handlePrice(saleItem, count);
  const hasSale = handleSaleTF(saleItem);

  if (layout === "hotdeal") {
    return (
      <div
        className={cn("flex items-center gap-[13px]", className)}
        role="group"
      >
        <em className="text-[25px] font-semibold text-black">
          {price.toLocaleString()}원{option && "~"}
        </em>
        {hasSale && (
          <span className="text-[17px] font-normal text-[#a9a9a9] line-through">
            {(count ?? 0).toLocaleString()}원
          </span>
        )}
      </div>
    );
  }

  if (layout === "row") {
    return (
      <div className={cn("flex flex-col gap-[15px]", className)} role="group">
        {hasSale && (
          <span className="text-xs font-normal text-[#a9a9a9] line-through">
            {(count ?? 0).toLocaleString()}원
          </span>
        )}
        <em className="!text-xl !font-bold !text-text-red">
          {price.toLocaleString()}원{option && "~"}
        </em>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)} role="group">
      {hasSale && (
        <span className="text-xs font-normal text-[#a9a9a9] line-through">
          {(count ?? 0).toLocaleString()}원
        </span>
      )}
      <em className="!text-lg !font-bold !text-text-red">
        {price.toLocaleString()}원{option && "~"}
      </em>
    </div>
  );
}
