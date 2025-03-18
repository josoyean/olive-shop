import React from "react";
import styled from "styled-components";
import { Center } from "../../public/assets/style";
const FooterContainer = () => {
  return (
    <Footer>
      <Center>
        <Container>
          <p>© 2025 올리브샵. All rights reserved.</p>
          <p className="mt-2">
            이미지 출처:{" "}
            <a
              href="https://www.flaticon.com/kr/free-icons/-"
              title="싸게 사는 물건 아이콘"
            >
              싸게 사는 물건 아이콘 제작자: Freepik - Flaticon
            </a>
          </p>
          <p className="mt-2">개인 프로젝트로 제작되었습니다.</p>
        </Container>
      </Center>
    </Footer>
  );
};
const Container = styled.div`
  a {
    color: #333;
    text-decoration: none;
  }
  p {
    color: #333;
    text-align: center;
    font-size: 14px;
  }
`;
const Footer = styled.footer`
  width: 100vw;
  border-top: 1px solid #aaa;
  background-color: #f3f3f3;
  padding: 40px 0;
  /* z-index: 88; */
  /* position: relative; */
`;
export default FooterContainer;
