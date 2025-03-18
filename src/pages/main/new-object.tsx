import React from "react";
import styled from "styled-components";
import { Center } from "../../../public/assets/style";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
const newObject = () => {
  return (
    <Center>
      <Wapper>
        {/* <h2>{title}</h2> */}
        <span>
          다른 상품보기 <RestartAltOutlinedIcon />
        </span>
      </Wapper>
    </Center>
  );
};

export default newObject;

const Wapper = styled.div`
  padding: 20px 0;
  > span {
    float: right;
    display: flex;
    align-items: center;
    cursor: pointer;
    column-gap: 5px;
  }
`;
