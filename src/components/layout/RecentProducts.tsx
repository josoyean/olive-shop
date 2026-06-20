import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { cn } from "@/lib/cn";
import { clearProducts } from "@/redux/reducers/recentProductsData";
import EmptyComponent from "@/components/EmptyComponent";
import ObjectCardColumn from "@/components/card/ObjectCardColumn";
import { ClickAwayListener, ClickAwayListenerProps } from "@mui/material";

const RecentProducts = ({
  onClickAway,
  onClose,
}: {
  onClickAway: ClickAwayListenerProps["onClickAway"];
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const productData = useSelector((state: RootState) => state?.recentProducts);

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div
        role="region"
        aria-label="Recently Viewed Products"
        className="flex min-h-[400px] w-[1020px] min-w-[1020px] max-w-[1020px] flex-col items-center justify-between gap-[25px] border border-line-main bg-white p-5 text-black"
      >
        <div className="header flex items-center gap-[15px]" role="group">
          <h2 role="heading" aria-level={2}>
            전체 <em className="text-primary">{productData?.length}</em>개
          </h2>
          <button
            role="button"
            className="border border-line-main px-2 py-[3px] text-sm"
            onClick={(event) => {
              event.preventDefault();
              dispatch(clearProducts());
            }}
          >
            전체 삭제
          </button>
        </div>
        <div className="wrapper w-full" role="group">
          {productData?.length > 0 ? (
            <div
              role="list"
              className={cn(
                "grid grid-cols-4 justify-around gap-x-5 gap-y-[30px]",
                "[&_.best-icon]:hidden [&_.object_box]:relative [&_.tags]:mt-[5px]",
                "[&_.object_box>span]:absolute [&_.object_box>span]:left-[-22px] [&_.object_box>span]:top-3 [&_.object_box>span]:z-[9]",
                "[&_.object_box>span]:block [&_.object_box>span]:h-12 [&_.object_box>span]:w-12 [&_.object_box>span]:cursor-pointer",
                "[&_.object_box>span]:rounded-full [&_.object_box>span]:border-2 [&_.object_box>span]:border-primary",
                "[&_.object_box>span]:bg-white [&_.object_box>span]:text-center [&_.object_box>span]:text-xl [&_.object_box>span]:font-bold [&_.object_box>span]:leading-[48px] [&_.object_box>span]:text-primary",
                "[&_.tags]:text-center [&_h5]:text-center"
              )}
            >
              {productData?.map((item, index) => (
                <ObjectCardColumn
                  size="230px"
                  key={index}
                  data={item}
                  onClick={() => {
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyComponent
              mainText="최근 본 상품이 없어요"
              subText=""
            ></EmptyComponent>
          )}
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default RecentProducts;
