import type { ReviewType } from "components/card/card.type";
import { forwardRef } from "react";
import { StarBox } from "@/components/ui";
import { getStarWidth } from "../../utils/common";
import { cn } from "@/lib/cn";

interface ReviewProps {
  data: {
    viewReview: ReviewType | null;
  };
}

const objectBoxClass = cn(
  "flex gap-5 border-b border-line-main py-5",
  "[&>div]:flex [&>div]:flex-col [&>div]:gap-[7px] [&>div]:pt-[5px]",
  "[&>div_em]:block [&>div_em]:overflow-hidden [&>div_em]:text-sm",
  "[&>div_strong]:text-sm [&>div_span]:text-sm [&>div_span]:font-semibold",
  "[&>img]:h-[90px] [&>img]:w-[90px] [&>img]:rounded-[3px]"
);

const ratingBoxClass = cn(
  "flex items-center gap-[15px] border-b border-line-main py-5",
  "[&_.MuiRating-iconActive]:scale-100 [&_.MuiRating-iconFilled]:text-[#ff3d47] [&_.MuiRating-iconHover]:scale-100 [&_.MuiRating-iconHover]:text-[#ff3d47]"
);

const reviewBoxClass =
  "py-5 [&>div]:min-h-[150px] [&>div]:rounded-[7px] [&>div]:border [&>div]:border-line-main [&>div]:p-[5px] [&>div_span]:text-[13px] [&>strong]:mb-[15px] [&>strong]:block";

const reviewImgBoxClass = cn(
  "[&>div]:mt-[15px] [&>div]:grid [&>div]:grid-cols-[repeat(5,120px)] [&>div]:justify-between",
  "[&>div_img]:h-[120px] [&>div_img]:w-[120px] [&>div_img]:rounded-[5px] [&>div_img]:border [&>div_img]:border-line-main"
);

const ReviewViewContainer = forwardRef<
  HTMLFormElement | HTMLInputElement,
  ReviewProps
>((props, ref) => {
  const { viewReview } = props?.data || {};

  return (
    <div role="region" aria-label="Review Details" ref={ref}>
      <div className={objectBoxClass} role="group">
        <img role="img" src={viewReview?.objectInfo?.img} alt="상품" />
        <div role="group">
          <strong role="heading" aria-level={3}>{viewReview?.objectInfo?.brand}</strong>
          <em>{viewReview?.objectInfo?.name}</em>
        </div>
      </div>
      <div className={ratingBoxClass} role="group" aria-label="Product Rating">
        <strong>상품 평점</strong>
        <StarBox role="list" size="25px">
          {[0, 1, 2, 3, 4].map((i) => (
            <li role="listitem" key={i}>
              <span
                className="rating"
                style={{
                  width: getStarWidth(i, viewReview?.score ?? 0),
                }}
              />
              <img
                src="/public/assets/images/icons/bg_rating_star.png"
                alt="bg_rating_star"
              />
            </li>
          ))}
        </StarBox>
      </div>
      <div className={reviewBoxClass} role="group" aria-label="Review Content">
        <strong>상품 리뷰</strong>
        <div role="article">
          <span
            dangerouslySetInnerHTML={{
              __html: viewReview?.reviewText?.replace(/\n/g, "<br />") ?? "",
            }}
          ></span>
        </div>
      </div>
      {(viewReview?.reviewImg || [])?.length > 0 && (
        <div className={reviewImgBoxClass} role="group" aria-label="Review Photos">
          <strong>포토</strong>
          <div role="list">
            {viewReview?.reviewImg?.map((img, index) => (
              <img role="img" key={index} src={img} alt="포토" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ReviewViewContainer;
