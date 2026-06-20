import type { CardImageType } from "@/components/card/card.type";
import { handlePrice, handleSaleTF } from "@/utils/common";
import { cn } from "@/lib/cn";

type TagVariant = "filled" | "outline";

interface ProductTagsProps {
  data?: CardImageType;
  variant?: TagVariant;
  showTodaySale?: boolean;
  className?: string;
}

const filledStyles: Record<string, string> = {
  sale: "bg-sale !text-white",
  coupon: "bg-coupon !text-white",
  free: "bg-free !text-white",
  oneMore: "bg-one-more !text-white",
  today_sale: "bg-today-sale !text-white",
};

const outlineStyles: Record<string, string> = {
  sale: "text-sale border-sale",
  coupon: "text-coupon border-coupon",
  free: "text-free border-free",
  oneMore: "text-one-more border-one-more",
  today_sale: "text-today-sale border-today-sale",
};

export function ProductTags({
  data,
  variant = "filled",
  showTodaySale = false,
  className,
}: ProductTagsProps) {
  if (!data) return null;

  const isOutline = variant === "outline";
  const baseClass = isOutline
    ? "float-left mr-[3px] ml-0 whitespace-normal px-[5px] text-xs leading-4 border border-[#666] rounded-[2.5px]"
    : "mr-0.5 whitespace-normal rounded-[10px] px-1.5 py-0.5 text-xs !text-white";

  const tags: { key: string; label: string }[] = [];

  if (handleSaleTF(data.saleItem)) tags.push({ key: "sale", label: "세일" });
  if (data.coupon) tags.push({ key: "coupon", label: "쿠폰" });
  if (data.saleItem?.one_more)
    tags.push({ key: "oneMore", label: `${data.saleItem.one_more}+1` });
  if (handlePrice(data.saleItem, data.count) >= 20000)
    tags.push({ key: "free", label: "무배" });
  if (showTodaySale) tags.push({ key: "today_sale", label: "오특" });

  if (tags.length === 0) return null;

  const styleMap = isOutline ? outlineStyles : filledStyles;

  return (
    <div
      className={cn(
        "!justify-normal gap-px",
        isOutline ? "" : "gap-px",
        className
      )}
      role="group"
    >
      {tags.map(({ key, label }) => (
        <span key={key} className={cn(baseClass, styleMap[key])}>
          {label}
        </span>
      ))}
    </div>
  );
}
