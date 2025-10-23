import type {
  PaymentObjectType,
  PaymentType,
  ReviewType,
} from "compontents/card/card.type";
import React, { forwardRef, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import { getStarWidth } from "../../bin/common";

interface ReviewProps {
  data: {
    viewReview: ReviewType | null; // 타입 명확하면 any 대신 string, number 등으로 바꿔줘요!
  };
}
const ReviewViewContainer = forwardRef<HTMLFormElement, ReviewProps>(
  (props, ref) => {
    const { viewReview } = props?.data || {};

    return (
      <div>
        <ObjectBox>
          <img src={viewReview?.objectInfo?.img} alt="상품" />
          <div>
            <strong>{viewReview?.objectInfo?.brand}</strong>
            <em>{viewReview?.objectInfo?.name}</em>
          </div>
        </ObjectBox>
        <RatingBox>
          <strong>상품 평점</strong>
          <StarBox size="25px">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i}>
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
        </RatingBox>
        <ReviewBox>
          <strong>상품 리뷰</strong>
          <div>
            <span
              dangerouslySetInnerHTML={{
                __html: viewReview?.reviewText?.replace(/\n/g, "<br />") ?? "",
              }}
            ></span>
          </div>
        </ReviewBox>
        {(viewReview?.reviewImg || [])?.length > 0 && (
          <ReviewImgBox>
            <strong>포토</strong>
            <div>
              {viewReview?.reviewImg?.map((img, index) => (
                <img key={index} src={img} alt="포토" />
              ))}
            </div>
          </ReviewImgBox>
        )}
      </div>
    );
  }
);
export const StarBox = styled.ul<{ size?: string }>`
  display: flex;
  column-gap: 4px;
  li {
    width: ${({ size }) => size ?? "20px"};
    height: ${({ size }) => size ?? "20px"};
    position: relative;
  }
  span {
    position: absolute;
    z-index: 4;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: ${({ size }) => size ?? "20px"};
    background-color: #f27370;
  }
  img {
    width: ${({ size }) => size ?? "20px"};
    height: ${({ size }) => size ?? "20px"};
    z-index: 9;
    position: absolute;
    overflow: hidden;
  }
`;

const ReviewImgBox = styled.div`
  > div {
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(5, 120px);
    justify-content: space-between;
    img {
      width: 120px;
      height: 120px;
      border: 1px solid ${theme.lineColor.main};
      border-radius: 5px;
    }
  }
`;
const ReviewBox = styled.div`
  padding: 20px 0;
  strong {
    margin-bottom: 15px;
    display: block;
  }

  > div {
    padding: 5px;
    border: 1px solid ${theme.lineColor.main};
    border-radius: 7px;
    min-height: 150px;
    span {
      font-size: 13px;
    }
  }
`;
const RatingBox = styled.div`
  display: flex;
  column-gap: 15px;
  padding: 20px 0;
  border-bottom: 1px solid ${theme.lineColor.main};
  align-items: center;
  .MuiRating-iconFilled,
  .MuiRating-iconHover {
    color: #ff3d47;
  }
  .MuiRating-iconActive,
  .MuiRating-iconHover {
    transform: none;
  }
`;
const ObjectBox = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid ${theme.lineColor.main};

  display: flex;
  column-gap: 20px;
  > div {
    padding-top: 5px;
    display: flex;
    flex-direction: column;
    row-gap: 7px;
    span {
      font-size: 14px;
      font-weight: 600;
    }
    strong {
      font-size: 14px;
    }
    em {
      font-size: 14px;
      overflow: hidden;
      display: block;
    }
  }
  img {
    width: 90px;
    height: 90px;
    border-radius: 3px;
  }
`;
export default ReviewViewContainer;
