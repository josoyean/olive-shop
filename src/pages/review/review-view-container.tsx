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
  "[&>div_strong]:text-sm [&>div_span]:text-sm [&>div_span]:font-semibold"
);

const ratingBoxClass = cn(
  "flex items-center gap-[15px] border-b border-line-main py-5",
  "[&_.MuiRating-iconActive]:scale-100 [&_.MuiRating-iconFilled]:text-[#ff3d47] [&_.MuiRating-iconHover]:scale-100 [&_.MuiRating-iconHover]:text-[#ff3d47]"
);

const reviewBoxClass =
  "py-5 [&>div]:min-h-[150px] [&>div]:rounded-[7px] [&>div]:border [&>div]:border-line-main [&>div]:p-[5px] [&>div_span]:text-[13px] [&>strong]:mb-[15px] [&>strong]:block";

function getReviewPhotos(reviewImg?: string[] | string | null): string[] {
  if (!reviewImg) return [];
  if (Array.isArray(reviewImg)) {
    return reviewImg.filter((img): img is string => typeof img === "string" && img.length > 0);
  }
  if (typeof reviewImg === "string") {
    try {
      const parsed = JSON.parse(reviewImg);
      return Array.isArray(parsed)
        ? parsed.filter((img): img is string => typeof img === "string" && img.length > 0)
        : [];
    } catch {
      return reviewImg.startsWith("data:") || reviewImg.startsWith("http")
        ? [reviewImg]
        : [];
    }
  }
  return [];
}

const ReviewViewContainer = forwardRef<
  HTMLFormElement | HTMLInputElement,
  ReviewProps
>((props, ref) => {
  const { viewReview } = props?.data || {};
  const photos = getReviewPhotos(viewReview?.reviewImg);

  return (
    <div role="region" aria-label="Review Details" ref={ref}>
      <div className={objectBoxClass} role="group">
        <img
          role="img"
          src={viewReview?.objectInfo?.img}
          alt="상품"
          className="h-[90px] w-[90px] shrink-0 rounded-[3px] object-cover"
        />
        <div role="group">
          <strong role="heading" aria-level={3}>
            {viewReview?.objectInfo?.brand}
          </strong>
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
                src="/assets/images/icons/bg_rating_star.png"
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
      {photos.length > 0 && (
        <div className="pb-5" role="group" aria-label="Review Photos">
          <strong className="mb-[15px] block">포토</strong>
          <div role="list" className="grid grid-cols-5 gap-3">
            {photos.map((img, index) => (
              <div
                role="listitem"
                key={`${img.slice(0, 24)}-${index}`}
                className="overflow-hidden rounded-[5px] border border-line-main bg-[#f6f7f8]"
                style={{ width: 120, height: 120 }}
              >
                <img
                  role="img"
                  src={img}
                  alt={`리뷰 포토 ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ReviewViewContainer;
