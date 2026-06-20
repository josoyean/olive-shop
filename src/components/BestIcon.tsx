import { cn } from "@/lib/cn";

const BestIcon = ({ best, today }: { best: boolean; today: boolean }) => {
  return (
    <div className="absolute left-2.5 top-[7px] flex flex-col gap-[3px]" role="status">
      {best && (
        <span
          className="inline-block h-12 w-12 rounded-full border-2 border-[#f05a5e] text-center text-sm font-bold leading-[44px] text-[#f05a5e] bg-white"
          aria-label="베스트 상품"
        >
          베스트
        </span>
      )}
      {today && (
        <span
          className="inline-block h-12 w-12 rounded-full border-2 border-today-sale text-center text-sm font-bold leading-[44px] text-today-sale bg-white"
          aria-label="오늘의 특가"
        >
          오특
        </span>
      )}
    </div>
  );
};

export default BestIcon;
