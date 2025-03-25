import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { supabase } from "../../supabase";
import type { CardImageType } from "compontents/card/card.type";
import { useNavigate } from "react-router-dom";

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
    afterChange: () => {
      setUpdateCount(updateCount + 1);
      setIsDragging(false);
    },
    beforeChange: (current, next: number) => {
      setSlideIndex(next);
      setIsDragging(true);
    },
  };

  useEffect(() => {
    const bannersData = async () => {
      const { data, error } = await supabase
        .from("banners")
        .select(`*,objects:object_seq(*)`);
      setBanner(data ?? []);
    };
    bannersData();
  }, []);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    seq: number
  ) => {
    if (isDragging) return; // 드래그 중이면 클릭 이벤트 무시

    navigate(`/store/brand-detail?getBrand=${seq}`);
  };
  return (
    <div>
      <BannerWrapper>
        <Slider className="slider-container" {...settings}>
          {banner?.map((item, index) => (
            <SliderBox
              key={index}
              onClick={(event) => {
                event.preventDefault();
                handleClick(event, item?.objects?.brand_seq);
              }}
            >
              <img src={item.img} alt={item.item} />
            </SliderBox>
          ))}
        </Slider>
        <ButtonWrapper>
          {slideIndex + 1} / {banner?.length}
        </ButtonWrapper>
      </BannerWrapper>
    </div>
  );
};

export default BannerContainer;

const BannerWrapper = styled.div`
  width: 100vw;
  height: 450px;
  max-width: 1920px;
  margin: 0 auto;
  position: relative;
  z-index: 999;
  .slick-dots {
    bottom: 10px;

    button:before {
      font-size: 9px;
    }
  }
  .slick-prev,
  .slick-next {
    width: 25px;
    height: 25px;
    &::before {
      font-size: 25px;
    }
  }
  .slick-next {
    right: calc((100% - 1020px) / 2 + 20px);
  }
  .slick-prev {
    left: calc((100% - 1020px) / 2 + 20px);
    z-index: 9;
  }
  li.slick-active {
    button:before {
      color: ${({ theme }) => theme.color.main};
    }
  }
`;
const SliderBox = styled.div`
  /* width: 100vw; */
  /* width: 1920px; */
  outline: none;
  height: 450px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    &:focus {
      border: none;
    }
  }
`;
const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 5px;
  left: calc((100% - 1020px) / 2 + 300px);
  color: ${({ theme }) => theme.fontColor.sub};
  font-size: ${({ theme }) => theme.fontSize.large};
`;
