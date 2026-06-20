import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

const Nav = () => {
  const [searchParams] = useSearchParams();
  const pageType = searchParams.get("t_page");
  return (
    <NavContainer role="navigation" aria-label="Mypage Navigation">
      <h1 role="heading" aria-level={1}>{pageType}</h1>
    </NavContainer>
  );
};
const NavContainer = styled.div`
  width: 170px;
  padding: 50px 10px;
`;
export default Nav;
