import type { PaymentObjectType } from "components/card/card.type";
import { forwardRef, useEffect, useRef, useState, type JSX } from "react";
import { Rating } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { TextareaField } from "@/components/ui";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { useSelector } from "react-redux";
import type { RootState } from "redux/store";
import { supabase } from "../../supabase";
import { cn } from "@/lib/cn";

interface ReviewWriteProps {
  data: {
    selectReview: PaymentObjectType | null;
    orders: PaymentObjectType[] | null;
    handleWriteReview: () => void;
  };
}

interface DataType {
  ratingValue?: number;
  textValue?: string;
}

const objectBoxClass = cn(
  "flex cursor-pointer gap-5 border-b border-line-main py-5",
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
  "py-5 pb-10 [&>em]:mt-[5px] [&>em]:block [&>em]:float-right [&>em]:text-[13px] [&>em]:text-[#ff3d47] [&>strong]:mb-[15px] [&>strong]:block";

const reviewImgBoxClass = cn(
  "[&>div]:mt-[15px] [&>div]:grid [&>div]:grid-cols-[repeat(5,120px)] [&>div]:justify-between",
  "[&_.review-preview-img__btns]:relative [&_.review-preview-img__btns]:h-[120px] [&_.review-preview-img__btns]:w-[120px] [&_.review-preview-img__btns]:border [&_.review-preview-img__btns]:border-line-main",
  "[&_.review-preview-img__btns_img]:h-full [&_.review-preview-img__btns_img]:w-full",
  "[&_.thumbnailClearBtn]:absolute [&_.thumbnailClearBtn]:right-[5px] [&_.thumbnailClearBtn]:top-[5px] [&_.thumbnailClearBtn]:block [&_.thumbnailClearBtn]:h-5 [&_.thumbnailClearBtn]:w-5 [&_.thumbnailClearBtn]:cursor-pointer",
  "[&_.thumbnailFile]:flex [&_.thumbnailFile]:h-full [&_.thumbnailFile]:w-full [&_.thumbnailFile]:items-center [&_.thumbnailFile]:justify-center [&_.thumbnailFile]:rounded-[5px] [&_.thumbnailFile_img]:h-10 [&_.thumbnailFile_img]:w-10"
);

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

    const fieldError = errors[firstError];

    if (!fieldError) return;

    if (fieldError.type === "noSpaces") {
      setValue(firstError, "");
    }

    setFocus(firstError);
    alert(fieldError.message || "Form validation error");
  };
  return (
    <form role="form" ref={ref} onSubmit={handleSubmit(onSubmit, onError)}>
      <div className={objectBoxClass} role="group">
        <img role="img" src={selectReview?.img} alt="상품" />
        <div role="group">
          <strong role="heading" aria-level={3}>{selectReview?.brand}</strong>
          <em>{selectReview?.name}</em>
        </div>
      </div>
      <div className={ratingBoxClass} role="group" aria-label="Rating">
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
                field.onChange(newValue);
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
      </div>
      <div className={reviewBoxClass} role="group" aria-label="Review Text">
        <strong>솔직한 상품 리뷰를 남겨주세요</strong>
        <Controller
          name="textValue"
          control={control}
          render={({ field }) => (
            <TextareaField
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
      </div>
      <div className={reviewImgBoxClass} role="group" aria-label="Review Photos">
        <strong>포토</strong>
        <div role="list">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="review-preview-img__btns" role="listitem" key={index}>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              {!reviewImages[index] ? (
                <span
                  role="button"
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
                <img role="img" src={reviewImages[index]} alt="" />
              )}
              {!reviewImages[index] || (
                <span
                  role="button"
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
      </div>
    </form>
  );
});

export default ReviewWriteContainer;
