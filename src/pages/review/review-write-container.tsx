import type { PaymentObjectType } from "compontents/card/card.type";
import { forwardRef, useEffect, useRef, useState, type JSX } from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import { Rating } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Textarea } from "../../../public/assets/style";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { useSelector } from "react-redux";
import type { RootState } from "redex/store";
import { supabase } from "../../supabase";

interface ReviewWriteProps {
  data: {
    selectReview: PaymentObjectType | null; // 타입 명확하면 any 대신 string, number 등으로 바꿔줘요!
    orders: PaymentObjectType[] | null; // 타입 명확하면 any 대신 string, number 등으로 바꿔줘요!
    handleWriteReview: () => void; // 함수 타입 명시
  };
}

interface DataType {
  ratingValue?: number;
  textValue?: string;
}

const ReviewWriteContainer = forwardRef<
  HTMLFormElement | HTMLInputElement,
  ReviewWriteProps
>((props, ref): JSX.Element => {
  const { selectReview, orders, handleWriteReview } = props.data || {};
  const token = useSelector((state: RootState) => state?.user.token);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    control,
    watch,
    getValues,
  } = useForm<DataType>({
    defaultValues: {
      ratingValue: 0,
      textValue: "",
    },
  });

  const watchTextValue = watch("textValue");
  const handlePaymentList = async (seq: string | undefined) => {
    const orderData = orders?.filter((item) => item.payment_seq !== seq);
    if (orderData?.length === 0) {
      // 데이터 삭제
      const { data } = await supabase
        .from("payment")
        .delete()
        .eq("userId", token)
        .eq("orderId", selectReview?.orderId);

      if (!data) {
        alert("리뷰 작성에 성공했습니다.");
        handleWriteReview();
      }
    } else {
      // 데이터 수정
      const { data, error: updateError } = await supabase
        .from("payment")
        .update({ objectsInfo: orderData })
        .eq("userId", token)
        .eq("orderId", selectReview?.orderId);

      if (updateError) {
        console.log("updateError", updateError);
        return;
      }

      if (!data) {
        alert("리뷰 작성에 성공했습니다.");
        handleWriteReview();
      }
    }
  };
  useEffect(() => {}, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewImages((prevState) => [...prevState, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: DataType) => {
    const items = {
      created_at: new Date().toISOString(),
      reviewImg: reviewImages,
      reviewText: data.textValue,
      score: Number(data.ratingValue),
      userId: token,
      objectInfo: selectReview?.object_seq,
      payment_seq: selectReview?.payment_seq,
      orderId: selectReview?.orderId,
      order_at: selectReview?.created_at,
      likeUserId: [],
    };

    const { data: existingItem, error } = await supabase
      .from("reviews")
      .insert([items]);
    if (error) {
      console.log("error", error);
      return;
    }
    if (!existingItem) {
      handlePaymentList(selectReview?.payment_seq || "");
    }
  };
  const onError = (errors: FieldErrors<DataType>) => {
    const errorKeys = Object.keys(errors);
    const fieldsOrder: (keyof DataType)[] = ["ratingValue", "textValue"];
    if (errorKeys.length === 0) return;

    const firstError = fieldsOrder.find((key) => errorKeys.includes(key));
    if (!firstError) return;

    const fieldError = errors[firstError]; // FieldError | undefined

    if (!fieldError) return;

    if (fieldError.type === "noSpaces") {
      setValue(firstError, "");
    }

    setFocus(firstError);
    alert(fieldError.message || "Form validation error");
  };
  return (
    <form ref={ref} onSubmit={handleSubmit(onSubmit, onError)}>
      <ObjectBox>
        <img src={selectReview?.img} alt="상품" />
        <div>
          <strong>{selectReview?.brand}</strong>
          <em>{selectReview?.name}</em>
        </div>
      </ObjectBox>
      <RatingBox>
        <strong>상품은 어떠셨나요?</strong>
        <Controller
          name="ratingValue"
          control={control}
          rules={{
            required: "별점을 선택해주세요.",
            min: {
              value: 1,
              message: "별점은 1점 이상 선택해주세요.",
            },
          }}
          render={({ field }) => (
            <Rating
              {...field}
              precision={1}
              onChange={(_, newValue: number | null) => {
                field.onChange(newValue); // 폼에 반영
              }}
              size="large"
              value={field.value}
              emptyIcon={
                <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
              }
              sx={{
                fontSize: "35px",
              }}
            />
          )}
        />
      </RatingBox>
      <ReviewBox>
        <strong>솔직한 상품 리뷰를 남겨주세요</strong>
        <Controller
          name="textValue"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              width="100%"
              height="200px"
              {...register("textValue", {
                required: "리뷰를 작성해주세요.",
                minLength: {
                  value: 20,
                  message: "20자 초과하여 작성 해주세요.",
                },
              })}
              onChange={(event) => {
                setValue("textValue", event.target.value);
              }}
              value={getValues("textValue") || ""}
              maxLength={1000}
              placeholder="꿀팁 가득, 상세한 리뷰를 작성해보세요!
도움수가 올라가면 포인트도 받고 탑리뷰어가 될 확률도 높아져요!
(최소 20자 이상 작성해주세요.)"
            />
          )}
        />
        <em>
          {(watchTextValue && getValues("textValue")?.length) || 0} / 1,000
        </em>
      </ReviewBox>
      <ReviewImgBox>
        <strong>포토</strong>
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="review-preview-img__btns" key={index}>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              {!reviewImages[index] ? (
                <span
                  className="thumbnailFile"
                  onClick={(event) => {
                    event.preventDefault();
                    fileInputRef?.current?.click();
                  }}
                >
                  <img
                    src="/public/assets/images/icons/ico_preview_cancel.png"
                    alt="삭제 버튼 이미지"
                    style={{ transform: "rotate(45deg)" }}
                  />
                </span>
              ) : (
                <img src={reviewImages[index]} alt="" />
              )}
              {!reviewImages[index] || (
                <span
                  className="thumbnailClearBtn"
                  onClick={(event) => {
                    event.preventDefault();
                    setReviewImages(
                      reviewImages.filter((_, idx) => idx !== index)
                    );
                  }}
                >
                  <img
                    src="/public/assets/images/icons/ico_preview_cancel.png"
                    alt="삭제 버튼 이미지"
                  />
                </span>
              )}
            </div>
          ))}
        </div>
      </ReviewImgBox>
    </form>
  );
});
const ReviewImgBox = styled.div`
  > div {
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(5, 120px);
    justify-content: space-between;
  }
  .review-preview-img__btns {
    width: 120px;
    height: 120px;
    border: 1px solid ${theme.lineColor.main};
    position: relative;
    .thumbnailFile {
      width: 100%;
      height: 100%;

      img {
        width: 40px;
        height: 40px;
      }
    }
    img {
      width: 100%;
      height: 100%;
    }
  }
  .thumbnailFile {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;

    border-radius: 5px;
  }

  .thumbnailClearBtn {
    width: 20px;
    height: 20px;
    display: block;
    position: absolute;
    right: 5px;
    top: 5px;
    cursor: pointer;
  }
`;
const ReviewBox = styled.div`
  padding: 20px 0 40px;
  strong {
    margin-bottom: 15px;
    display: block;
  }

  > em {
    font-size: 13px;
    color: #ff3d47;
    /* margin-right: auto; */
    display: block;
    float: right;
    margin-top: 5px;
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
  /* border-top: 2px solid #000; */
  border-bottom: 1px solid ${theme.lineColor.main};
  cursor: pointer;
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
export default ReviewWriteContainer;
