import React, { useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import { theme } from "../../public/assets/styles/theme";
import { useLocation } from "react-router-dom";

const TopButton = () => {
  const [block, setBlock] = useState<boolean>(false);
  const location = useLocation();
  const handleScroll = useCallback(() => {
    if (window.pageYOffset > 180) {
      // 탑버튼 보이게
      setBlock(true);
    } else {
      // 탑버튼 안 보이게
      setBlock(false);
    }
  }, [location.pathname]);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);
  return (
    <Container
      onClick={(event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      $block={block}
    >
      TOP
    </Container>
  );
};
const Container = styled.div<{ $block: boolean }>`
  position: fixed;
  visibility: ${({ $block }) =>
    $block ? "visible" : "hidden"}; /* 안 보이게 */
  opacity: ${({ $block }) => ($block ? 1 : 0)};
  right: calc((100vw - 1020px) / 2 - 210px); /* 왼쪽 여백 */
  width: 55px;
  height: 55px;
  transition: opacity 500ms linear, visibility 500ms linear;
  color: #fff;
  bottom: 75px;
  text-align: center;
  cursor: pointer;
  line-height: 55px;
  font-size: 14px;
  background-color: ${theme.color.main};
  border: 1px solid ${({ theme }) => theme.lineColor.main};
  border-radius: 50%;
`;
export default TopButton;
