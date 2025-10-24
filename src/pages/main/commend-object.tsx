import React, { useState } from "react";
import styled from "styled-components";
import { theme } from "../../../public/assets/styles/theme";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { useInterval } from "usehooks-ts";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";
import type { CardImageType } from "../../compontents/card/card.type";

interface CommendObjectProps {
  title: string;
  style?: React.CSSProperties;
  data: CardImageType[];
}

const CommendObject: React.FC<CommendObjectProps> = (props) => {
  const { title, style, data } = props;
  const [imageIndex, setImageIndex] = useState<number>(0);

  useInterval(() => {
    setImageIndex((current) => (current + 1) % (data.length / 2));
  }, 10000);

  return (
    <Container
      style={{ ...style, borderBottom: `1px solid ${theme.lineColor.main}` }}
    >
      <CommendWapper>
        <h2>{title}</h2>
        <span
          onClick={() => {
            setImageIndex((current) => (current + 1) % (data.length / 2));
          }}
        >
          다른 상품보기 <RestartAltOutlinedIcon />
        </span>
        <ObjectWapper>
          <ObjectCardColumn size="230px" data={data && data[imageIndex * 2]} />
          <ObjectCardColumn
            size="230px"
            data={
              data && !data[imageIndex * 2 + 1]
                ? data[0]
                : data[imageIndex * 2 + 1]
            }
          />
        </ObjectWapper>
      </CommendWapper>
    </Container>
  );
};

export default CommendObject;
const Container = styled.div`
  width: 50%;
`;
const CommendWapper = styled.div`
  padding: 20px 0;

  > span {
    float: right;
    display: flex;
    align-items: center;
    cursor: pointer;
    column-gap: 5px;
  }
`;
const ObjectWapper = styled.div`
  display: flex;
  margin-top: 40px;
  flex-direction: row;
  justify-content: space-between;
`;
