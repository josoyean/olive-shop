import React, { useRef } from "react";
import { Center } from "@/components/ui";
import ObjectCardRow from "../../components/card/ObjectCardRow";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { CardImageType } from "../../components/card/card.type";
import { cn } from "@/lib/cn";

const HotObject: React.FC<{ data: CardImageType[] }> = ({ data }) => {
  const sliderRef = useRef<Slider | null>(null);
  const listRef = useRef<Slider | null>(null);
  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: listRef?.current ?? undefined,
  };
  const listSettings = {
    infinite: true,
    speed: 600,
    autoplay: true,
    vertical: true,
    centerPadding: "10px",
    swipeToSlide: true,
    autoplaySpeed: 5000,
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: sliderRef?.current ?? undefined,
    centerMode: true,
    focusOnSelect: true,
  };

  return (
    <Center
      className={cn(
        "my-[60px] [&_h2]:text-center",
        "[&_.list-container]:h-[200px] [&_.list-container]:w-1/2 [&_.list-container]:overflow-hidden [&_.slider-container]:w-1/2",
        "[&_.list-container_.slick-slide_span]:block [&_.list-container_.slick-slide_span]:box-border [&_.list-container_.slick-slide_span]:overflow-hidden [&_.list-container_.slick-slide_span]:text-ellipsis [&_.list-container_.slick-slide_span]:break-keep [&_.list-container_.slick-slide_span]:p-[8px_3px] [&_.list-container_.slick-slide_span]:font-normal [&_.list-container_.slick-slide_span]:text-[#a4a4a4]",
        "[&_.list-container_.slick-slide_em]:inline-block [&_.list-container_.slick-slide_em]:w-[30px] [&_.list-container_.slick-slide_em]:font-normal [&_.list-container_.slick-slide_em]:text-[#95bcfa]",
        "[&_.list-container_.slick-slide.slick-active.slick-current.slick-center_span]:rounded-[5px] [&_.list-container_.slick-slide.slick-active.slick-current.slick-center_span]:border [&_.list-container_.slick-slide.slick-active.slick-current.slick-center_span]:border-line-main [&_.list-container_.slick-slide.slick-active.slick-current.slick-center_span]:font-bold [&_.list-container_.slick-slide.slick-active.slick-current.slick-center_span]:text-[#181818]",
        "[&_.list-container_.slick-slide.slick-active.slick-current.slick-center_em]:font-bold [&_.list-container_.slick-slide.slick-active.slick-current.slick-center_em]:text-primary"
      )}
      role="region"
      aria-label="조회 급상승, 인기템"
    >
      <h2>조회 급상승, 인기템</h2>
      <div className="mt-[15px] box-border flex border border-line-main p-[15px]">
        <Slider className="slider-container" {...settings} ref={sliderRef}>
          {data &&
            data?.map((item, index) => (
              <ObjectCardRow
                size="469px"
                option={false}
                imgSize="200px"
                data={item}
                key={index}
              ></ObjectCardRow>
            ))}
        </Slider>
        <Slider className="list-container" {...listSettings} ref={listRef}>
          {data &&
            data?.map((item, index) => (
              <span key={index}>
                <em style={{ marginRight: "5px" }}>{index + 1}위</em>
                {item.name}
              </span>
            ))}
        </Slider>
      </div>
    </Center>
  );
};

export default HotObject;
