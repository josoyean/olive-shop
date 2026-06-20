import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Center } from "../../../public/assets/style";
import type { BrandType } from "compontents/card/card.type";
import Slider, { type CustomArrowProps } from "react-slick";
import ObjectCardRow from "../../compontents/card/ObjectCardRow";
import { useNavigate } from "react-router-dom";

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
    // autoplay: true,
    arrows: true,
    // autoplaySpeed: 3000,
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
    <Container role="region" aria-label={title}>
      <h2>{title}</h2>
      <div>
        <BrandNameWrapper role="tablist" aria-label="브랜드 목록">
          {data?.map((item, index) => (
            <li
              className={`${index === activeIndex ? "on" : ""}`}
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
        </BrandNameWrapper>
        <Slider className="slider-container" {...settings} ref={sliderRef}>
          {data?.map((item) => (
            <div key={item.id}>
              <ImageWrapper
                onClick={(event) => {
                  event.preventDefault();
                  console.log(item.brand_seq);
                  navigate(`/store/brand-detail?getBrand=${item.brand_seq}`);
                }}
              >
                <img src={item.brandImg} alt="brandImg" />
                <span>{item.name}</span>
              </ImageWrapper>
              <ObjectWrapper>
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
              </ObjectWrapper>
            </div>
          ))}
        </Slider>
      </div>
    </Container>
  );
};
const ObjectWrapper = styled.div`
  padding: 30px;
  display: flex;
  column-gap: 20px;

  .best-icon {
    width: 30px;
    font-size: 8px;
    height: 30px;
    top: 5px;
    left: 5px;
    line-height: 27px !important;
  }
  .img-box em {
    font-size: 14px;
  }
`;
const ImageWrapper = styled.div`
  height: 400px;
  width: 100%;
  position: relative;
  &:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-image: linear-gradient(
      180deg,
      rgba(19, 21, 24, 0) 0,
      rgba(19, 21, 24, 0.4) 100%
    );
    content: "";
  }
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 30px;
    font-weight: 600;
    color: #fff;
    z-index: 9;
  }
`;
const BrandNameWrapper = styled.ul`
  display: flex;
  justify-content: center;
  column-gap: 8px;
  li {
    width: auto;
    cursor: pointer;
    padding: 5px 16px 6px;
    line-height: 21px;
    border-radius: 20px;
    border: 1px solid #dadde0;
    color: #757d86;
    font-size: 14px;
    font-weight: 600;
  }
  .on {
    border: 1px solid #000;
    color: #fff;
    background-color: #000;
  }
`;
const Container = styled(Center)`
  margin: 60px auto;

  h2 {
    text-align: center;
  }

  > div {
    margin-top: 30px;

    .slider-container {
      margin-top: 20px;
    }
  }
  .slick-prev,
  .slick-next {
    width: unset;
    z-index: 99;
    height: unset;
  }
  .slick-prev {
    top: calc(400px / 2);
    left: 5px;
  }
  .slick-next {
    top: calc(400px / 2 - 55px);
    right: 5px;
  }
  .slick-prev::before,
  .slick-next::before {
    /* width: 100%; */
    /* height: 100%; */
    content: url("/assets/images/icons/icon_brand_slide_button.png");
  }
  .slick-next {
    transform: scaleX(-1);
  }
`;
export default BrandsContainer;
