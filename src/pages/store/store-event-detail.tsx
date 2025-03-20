import React from "react";
import { Center } from "../../../public/assets/style";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import moment from "moment";

const StoreEventDetail = () => {
  const information = useLocation().state;

  console.log(information);
  return (
    <Center>
      <Container>
        <div>
          <div>
            {(information?.off_line || information?.on_line) && (
              <Tags
                $color={
                  information?.off_line && information?.on_line
                    ? "온&오프라인"
                    : information?.off_line
                    ? "오프라인몰"
                    : "온라인몰"
                }
              >
                {information?.off_line && information?.on_line
                  ? "온&오프라인"
                  : information?.off_line
                  ? "오프라인몰"
                  : "온라인몰"}
              </Tags>
            )}
            <h2>{information?.detail_text}</h2>
          </div>
          <em>
            {moment(information?.start_date).format("YYYY-MM-DD")} ~{" "}
            {moment(information?.end_date).format("YYYY-MM-DD")}
          </em>
        </div>
        <img src={information?.detail_img} alt="detail_img" />
      </Container>
    </Center>
  );
};

export default StoreEventDetail;
const Tags = styled.span<{ $color: string }>`
  min-width: 100px;
  text-align: center;
  color: #fff;
  display: inline-block;
  height: 28px;
  line-height: 28px;
  font-size: 13px;
  border-radius: 20px;
  background-color: ${({ $color }) =>
    $color === "온&오프라인"
      ? "#d87299"
      : $color === "오프라인몰"
      ? "#9f87c9"
      : "#9bce26"};
  font-weight: 700;
`;
const Container = styled.div`
  > div {
    padding: 15px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    h2 {
      font-weight: 350;
    }
    em {
      color: #333;
    }
    > div {
      align-items: stretch;
      column-gap: 15px;
      display: flex;
    }
  }

  img {
    width: 750px;
    margin: 40px auto;
    display: block;
  }
`;
