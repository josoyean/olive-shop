import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { CardImageType } from "components/card/card.type";
import { useNavigate } from "react-router-dom";
import { bannersData } from "../../api/axios-index";
import { cn } from "@/lib/cn";

interface BannerType {
  object_seq: number;
  created_at: string;
  item: string;
  img: string;
  id: number;
  objects: CardImageType;
}

const BannerContainer: React.FC = () => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [updateCount, setUpdateCount] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [banner, setBanner] = useState<BannerType[]>();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    draggable: false,
    afterChange: () => {
      setUpdateCount(updateCount + 1);
      setIsDragging(false);
    },
    beforeChange: (_: number, next: number) => {
      setSlideIndex(next);
      setIsDragging(true);
    },
  };

  useEffect(() => {
    bannersData()
      .then((data) => {
        setBanner(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    seq: number
  ) => {
    event.preventDefault();
    if (isDragging) return;

    navigate(`/store/brand-detail?getBrand=${seq}`);
  };
  return (
    <section role="region" aria-label="메인 배너">
      <div
        role="group"
        aria-roledescription="슬라이드"
        className={cn(
          "relative z-[99] mx-auto h-[450px] w-full max-w-[1920px]",
          "[&_.slick-dots]:bottom-[10px] [&_.slick-dots_button:before]:text-[9px]",
          "[&_.slick-prev]:left-[calc((100%-1020px)/2+20px)] [&_.slick-prev]:z-[9] [&_.slick-prev]:h-[25px] [&_.slick-prev]:w-[25px]",
          "[&_.slick-next]:right-[calc((100%-1020px)/2+20px)] [&_.slick-next]:h-[25px] [&_.slick-next]:w-[25px]",
          "[&_.slick-prev:before]:text-[25px] [&_.slick-next:before]:text-[25px]",
          "[&_li.slick-active_button:before]:text-primary"
        )}
      >
        <Slider className="slider-container" {...settings}>
          {banner?.map((item, index) => (
            <div
              key={index}
              className="h-[450px] outline-none [&_img:focus]:border-none [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
              onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                event.preventDefault();
                if (item?.objects?.brand_seq === undefined) return;
                handleClick(event, item?.objects?.brand_seq ?? 0);
              }}
            >
              <img src={item.img} alt={item.item} />
            </div>
          ))}
        </Slider>
        <div className="absolute bottom-[5px] left-[calc((100%-1020px)/2+300px)] text-base font-bold text-text-sub">
          {slideIndex + 1} / {banner?.length}
        </div>
      </div>
    </section>
  );
};

export default BannerContainer;
