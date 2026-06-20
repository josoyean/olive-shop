import React from "react";
import { Center } from "@/components/ui";
import type { EventImagesType } from "../main";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

interface EventTypes {
  title: string;
  images: EventImagesType[];
}
const EventContainer: React.FC<EventTypes> = (props) => {
  const { title, images } = props;
  const navigate = useNavigate();
  return (
    <Center className="my-[60px] [&_h2]:text-center" role="region" aria-label={title}>
      <h2>{title}</h2>
      <div
        className={cn(
          "mt-[15px] grid gap-x-5",
          "[&>div]:relative [&>div]:h-[250px] [&>div]:cursor-pointer",
          "[&>div_img]:absolute [&>div_img]:inset-0 [&>div_img]:h-full [&>div_img]:w-full [&>div_img]:object-cover [&>div_img]:object-center [&>div_img]:brightness-[0.8]",
          "[&>div_h4]:absolute [&>div_h4]:bottom-[50px] [&>div_h4]:left-1/2 [&>div_h4]:-translate-x-1/2 [&>div_h4]:whitespace-nowrap [&>div_h4]:text-center [&>div_h4]:text-[26px] [&>div_h4]:font-bold [&>div_h4]:text-white",
          "[&>div_h6]:absolute [&>div_h6]:bottom-[10px] [&>div_h6]:left-1/2 [&>div_h6]:-translate-x-1/2 [&>div_h6]:whitespace-nowrap [&>div_h6]:text-center [&>div_h6]:text-lg [&>div_h6]:font-extralight [&>div_h6]:text-white"
        )}
        style={{ gridTemplateColumns: `repeat(${images?.length}, 1fr)` }}
        role="list"
        aria-label="이벤트 목록"
      >
        {images?.map((image, index) => (
          <div
            key={index}
            onClick={(event) => {
              event.preventDefault();
              navigate(
                `/store/brand-detail?getBrand=${image?.objects?.brand_seq}`
              );
            }}
          >
            <img src={image.img} alt="이벤트 사진" />
            <h4 dangerouslySetInnerHTML={{ __html: image.mainText ?? "" }}></h4>
            <h6>{image.subText}</h6>
          </div>
        ))}
      </div>
    </Center>
  );
};

export default EventContainer;
