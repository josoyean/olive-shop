import React from "react";
import { Center } from "../../../public/assets/style";
import Nav from "./nav";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import Mypage from "./mypage";
const StoreMypage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageType = searchParams.get("t_page");
  return (
    <div>
      <Center style={{ display: "flex" }}>
        <Nav></Nav>
        <Mypage></Mypage>
      </Center>
    </div>
  );
};

export default StoreMypage;
