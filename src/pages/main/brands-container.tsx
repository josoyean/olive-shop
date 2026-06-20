import React, { useCallback, useEffect, useRef, useState } from "react";
import { Center } from "@/components/ui";
import type { BrandType } from "components/card/card.type";
import Slider, { type CustomArrowProps } from "react-slick";
import ObjectCardRow from "../../components/card/ObjectCardRow";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

interface BrandsContainerProps {
  title: string;
  data: BrandType[];
}
const BrandsContainer: React.FC<BrandsContainerProps> = (props) => {
  const { title, data } = props;
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const sliderRef = useRef<Slider | null>(null);
  const settings = {
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    draggable: false,
    afterChange: (currentSlide: number) => {
      setActiveIndex(currentSlide);
    },
    nextArrow: <SampleNextArrow className="next" />,
    prevArrow: <SamplePrevArrow className="prev" />,
  };
  const handleLoadData = useCallback(async () => {}, []);

  function SampleNextArrow(props: CustomArrowProps) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      />
    );
  }

  function SamplePrevArrow(props: CustomArrowProps) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      />
    );
  }
  useEffect(() => {
    handleLoadData();
  }, []);
  return (
    <Center
      className={cn(
        "my-[60px] [&_h2]:text-center",
        "[&>div]:mt-[30px] [&_.slider-container]:mt-5",
        "[&_.slick-prev]:left-[5px] [&_.slick-prev]:top-[calc(400px/2)] [&_.slick-prev]:z-[99] [&_.slick-prev]:h-auto [&_.slick-prev]:w-auto",
        "[&_.slick-next]:right-[5px] [&_.slick-next]:top-[calc(400px/2-55px)] [&_.slick-next]:z-[99] [&_.slick-next]:h-auto [&_.slick-next]:w-auto [&_.slick-next]:-scale-x-100",
        "[&_.slick-prev:before]:content-[url('/assets/images/icons/icon_brand_slide_button.png')]",
        "[&_.slick-next:before]:content-[url('/assets/images/icons/icon_brand_slide_button.png')]"
      )}
      role="region"
      aria-label={title}
    >
      <h2>{title}</h2>
      <div>
        <ul
          className="flex justify-center gap-2"
          role="tablist"
          aria-label="브랜드 목록"
        >
          {data?.map((item, index) => (
            <li
              className={cn(
                "w-auto cursor-pointer rounded-[20px] border border-[#dadde0] px-4 py-[5px] pb-1.5 text-sm font-semibold leading-[21px] text-[#757d86]",
                index === activeIndex && "border-black bg-black text-white"
              )}
              key={index}
              role="tab"
              aria-selected={index === activeIndex}
              onClick={(event) => {
                event.preventDefault();
                setActiveIndex(index);
                sliderRef.current?.slickGoTo(index);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
        <Slider className="slider-container" {...settings} ref={sliderRef}>
          {data?.map((item) => (
            <div key={item.id}>
              <div
                className="relative h-[400px] w-full after:absolute after:inset-0 after:z-[1] after:bg-[linear-gradient(180deg,rgba(19,21,24,0)_0,rgba(19,21,24,0.4)_100%)] after:content-[''] [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                onClick={(event) => {
                  event.preventDefault();
                  console.log(item.brand_seq);
                  navigate(`/store/brand-detail?getBrand=${item.brand_seq}`);
                }}
              >
                <img src={item.brandImg} alt="brandImg" />
                <span className="absolute left-1/2 top-1/2 z-[9] -translate-x-1/2 -translate-y-1/2 text-[30px] font-semibold text-white">
                  {item.name}
                </span>
              </div>
              <div className="flex gap-5 p-[30px] [&_.best-icon]:left-[5px] [&_.best-icon]:top-[5px] [&_.best-icon]:h-[30px] [&_.best-icon]:w-[30px] [&_.best-icon]:text-[8px] [&_.best-icon]:leading-[27px] [&_.img-box_em]:text-sm">
                <ObjectCardRow
                  size={`${(50 / 100) * 100}%`}
                  option={false}
                  imgSize="100px"
                  data={item?.object?.[0]}
                ></ObjectCardRow>

                <ObjectCardRow
                  size={`${(50 / 100) * 100}%`}
                  option={false}
                  imgSize="100px"
                  data={item?.object?.[1]}
                ></ObjectCardRow>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </Center>
  );
};

export default BrandsContainer;
