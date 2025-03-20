import React from "react";
import styled from "styled-components";
import { Center } from "../../../public/assets/style";
import type { EventImagesType } from "../main";
import { useNavigate } from "react-router-dom";

interface EventTypes {
  title: string;
  images: EventImagesType[];
}
const EventContainer: React.FC<EventTypes> = (props) => {
  const { title, images } = props;
  const navigate = useNavigate();
  return (
    <Container>
      <h2>{title}</h2>
      <ImagesContainer grid={images?.length}>
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
      </ImagesContainer>
    </Container>
  );
};

export default EventContainer;
const Container = styled(Center)`
  margin: 60px auto;

  h2 {
    text-align: center;
  }
`;
const ImagesContainer = styled.div<{ grid: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.grid}, 1fr);
  margin-top: 15px;
  column-gap: 20px;
  > div {
    position: relative;
    height: 250px;
    cursor: pointer;
    img {
      position: absolute;
      top: 0;
      object-position: center;
      object-fit: cover;
      bottom: 0;
      right: 0;
      left: 0;
      width: 100%;
      height: 100%;
      filter: brightness(0.8);
    }

    h4,
    h6 {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      white-space: nowrap;
      text-align: center;
    }

    h4 {
      bottom: 50px;
      font-weight: bold;
      font-size: 26px;
    }
    h6 {
      bottom: 10px;
      font-weight: 200;
      font-size: 18px;
    }
  }
`;
