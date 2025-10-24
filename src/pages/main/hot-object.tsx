import React, { useRef } from "react";
import styled from "styled-components";
import { Center } from "../../../public/assets/style";
import ObjectCardRow from "../../compontents/card/ObjectCardRow";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { CardImageType } from "../../compontents/card/card.type";

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
    <ItemsContainer>
      <h2>조회 급상승, 인기템</h2>
      <Container>
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
      </Container>
    </ItemsContainer>
  );
};

export default HotObject;
const ItemsContainer = styled(Center)`
  margin: 60px auto;

  h2 {
    text-align: center;
  }
  .list-container,
  .slider-container {
    width: 50%;
  }

  .list-container {
    height: 200px;
    overflow: hidden;
    .slick-slide {
      span {
        color: #a4a4a4;
        font-weight: 400;
      }
      em {
        /* background-color: red; */
        font-weight: 400;
        color: #95bcfa;
      }
    }
    .slick-slide.slick-active.slick-current.slick-center {
      span {
        border-radius: 5px;
        border: 1px solid ${({ theme }) => theme.lineColor.main};
        color: #181818;
        font-weight: 700;
        em {
          color: #116dff;
          font-weight: 700;
        }
      }
    }

    span {
      padding: 8px 3px;
      box-sizing: border-box;
      overflow: hidden;
      display: block;
      word-break: keep-all;
      text-overflow: ellipsis;
      em {
        display: inline-block;
        width: 30px;
      }
    }
  }
`;

const Container = styled.div`
  margin-top: 15px;
  border: 1px solid ${({ theme }) => theme.lineColor.main};
  padding: 15px;
  box-sizing: border-box;
  display: flex;
`;
