import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/redux/store";
import { cn } from "@/lib/cn";
import {
  clearProducts,
  removeProduct,
} from "@/redux/reducers/recentProductsData";
import { handlePrice, handleSaleTF } from "@/utils/common";
import type { CardImageType } from "@/components/card/card.type";
import { ClickAwayListener, ClickAwayListenerProps } from "@mui/material";

const RecentProducts = ({
  onClickAway,
  onClose,
}: {
  onClickAway: ClickAwayListenerProps["onClickAway"];
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productData = useSelector((state: RootState) => state?.recentProducts);
  const count = productData?.length ?? 0;

  const openProduct = (item: CardImageType) => {
    if (!item?.object_seq) return;
    navigate(`/store/goods-detail?getGoods=${item.object_seq}`);
    onClose();
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div
        role="region"
        aria-label="최근 본 상품"
        className="w-[640px] overflow-hidden rounded-lg border border-line-sub bg-white text-text-main shadow-[0_12px_40px_rgba(19,21,24,0.12)]"
      >
        <div className="flex items-center justify-between border-b border-line-sub px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">최근 본 상품</h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white">
              {count}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {count > 0 && (
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-text-sub transition-colors hover:bg-[#f4f5f7] hover:text-text-main"
                onClick={(event) => {
                  event.preventDefault();
                  dispatch(clearProducts());
                }}
              >
                전체 삭제
              </button>
            )}
            <button
              type="button"
              aria-label="닫기"
              className="flex h-7 w-7 items-center justify-center rounded text-lg leading-none text-text-sub transition-colors hover:bg-[#f4f5f7] hover:text-text-main"
              onClick={(event) => {
                event.preventDefault();
                onClose();
              }}
            >
              ×
            </button>
          </div>
        </div>

        {count > 0 ? (
          <ul
            role="list"
            className="grid max-h-[420px] grid-cols-4 gap-3 overflow-y-auto p-4"
          >
            {productData.map((item) => {
              const price = handlePrice(item?.saleItem, item?.count);
              const hasSale = handleSaleTF(item?.saleItem);

              return (
                <li key={item.object_seq} className="group relative">
                  <button
                    type="button"
                    className="flex w-full flex-col text-left"
                    onClick={(event) => {
                      event.preventDefault();
                      openProduct(item);
                    }}
                  >
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-md bg-[#f6f7f8]">
                      <img
                        src={item?.img}
                        alt={item?.name || "상품 이미지"}
                        className={cn(
                          "h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]",
                          item?.soldOut && "brightness-75"
                        )}
                      />
                      {item?.soldOut && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                          품절
                        </span>
                      )}
                    </div>

                    {item?.brand && (
                      <span className="mb-0.5 block truncate text-[11px] text-[#888]">
                        {item.brand}
                      </span>
                    )}
                    <p className="mb-1 line-clamp-2 h-8 text-xs leading-4 text-text-main">
                      {item?.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      {hasSale && (
                        <span className="text-[10px] text-[#aaa] line-through">
                          {(item?.count ?? 0).toLocaleString()}
                        </span>
                      )}
                      <em className="text-sm font-bold text-text-main">
                        {price.toLocaleString()}원
                      </em>
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-label={`${item?.name ?? "상품"} 삭제`}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[11px] leading-none text-white opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dispatch(removeProduct(item.object_seq));
                    }}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-lg text-[#9aa0a6]">
              ◌
            </div>
            <p className="mb-1 text-sm font-semibold text-text-main">
              최근 본 상품이 없습니다
            </p>
            <p className="text-xs leading-5 text-[#888]">
              상품 상세를 보면 여기에 기록이 쌓입니다.
            </p>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default RecentProducts;
