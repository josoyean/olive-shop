import React from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
import "react-loading-skeleton/dist/skeleton.css";
interface CardsType {
  count: number;
  gridCount?: number;
  width: string;
  gap?: string;
  style?: React.CSSProperties;
}
const Cards = ({ width, count, gridCount = 4, gap, style }: CardsType) => {
  return (
    <Wrapper
      style={{
        ...style,
        gridTemplateColumns: `repeat(${gridCount},${width})`,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Container style={{ width: width }} key={index}>
          <Skeleton width={width} height={width} />
          <Skeleton width={width} count={2} />
          <div>
            <Skeleton width={"150px"} />
            <Skeleton width={"40px"} height={"40px"} circle className="test" />
          </div>
          <Skeleton width={"170px"} />
        </Container>
      ))}
    </Wrapper>
  );
};

export default Cards;
const Wrapper = styled.div`
  display: grid;
  width: 100%;
  justify-content: space-between;
  /* grid-gap: 20px; */
`;
const Container = styled.div`
  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .test {
    width: 40px;
    height: 40px;
  }
`;
